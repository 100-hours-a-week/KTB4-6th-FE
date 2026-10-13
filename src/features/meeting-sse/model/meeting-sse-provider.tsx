'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import * as Sentry from '@sentry/nextjs';
import { joinMeeting } from '../api/join-meeting';
import { CHAT_SSE_EVENT_TYPES, type ChatSseEventData } from './chat-event';
import { getCurrentMeetingQueryKey } from './current-meeting-query-key';
import { createListenerRegistry } from './listener-registry';
import { RECORDING_SSE_EVENT_TYPES, type RecordingSseEventType } from './recording-event';
import type { TranscriptCreatedEventData } from './transcript-event';
import { useMeetingChatEvents } from './use-meeting-chat-events';
import { useMeetingTranscripts } from './use-meeting-transcripts';

export type MeetingSseStatus = 'idle' | 'unconfigured' | 'connecting' | 'connected' | 'error';

interface MeetingSseContextValue {
  statuses: Record<string, MeetingSseStatus>;
  transcriptsByMeetingId: Record<string, TranscriptCreatedEventData[]>;
  connect: (meetingId: string) => void;
  disconnect: (meetingId: string) => void;
  subscribeChatEvent: (
    meetingId: string,
    listener: (event: ChatSseEventData) => void,
  ) => () => void;
  subscribeDeleted: (meetingId: string, listener: () => void) => () => void;
  subscribeRecordingEvent: (
    meetingId: string,
    listener: (type: RecordingSseEventType) => void,
  ) => () => void;
  subscribeTranscriptCreated: (
    meetingId: string,
    listener: (transcript: TranscriptCreatedEventData) => void,
  ) => () => void;
}

const MeetingSseContext = createContext<MeetingSseContextValue | null>(null);

interface MeetingSseProviderProps {
  children: ReactNode;
}

export function MeetingSseProvider({ children }: MeetingSseProviderProps) {
  const queryClient = useQueryClient();
  const sources = useRef(new Map<string, EventSource>());
  const joining = useRef(new Map<string, { cancelled: boolean }>());
  const reconnectedAfterClose = useRef(new Set<string>());
  const reconnect = useRef<(meetingId: string) => void>(() => {});
  const [deletedListeners] = useState(() => createListenerRegistry());
  const [recordingListeners] = useState(() => createListenerRegistry<[RecordingSseEventType]>());
  const [statuses, setStatuses] = useState<Record<string, MeetingSseStatus>>({});
  const { subscribeChatEvent, receiveChatEvent } = useMeetingChatEvents();
  const { transcriptsByMeetingId, subscribeTranscriptCreated, receiveTranscript } =
    useMeetingTranscripts();

  const disconnect = useCallback((meetingId: string) => {
    const pendingJoin = joining.current.get(meetingId);
    if (pendingJoin) {
      pendingJoin.cancelled = true;
      joining.current.delete(meetingId);
    }
    reconnectedAfterClose.current.delete(meetingId);

    const source = sources.current.get(meetingId);
    if (source) {
      source.onopen = null;
      source.onerror = null;
      source.close();
      sources.current.delete(meetingId);
    }
    setStatuses((current) =>
      current[meetingId] === 'idle' ? current : { ...current, [meetingId]: 'idle' },
    );
  }, []);

  const connect = useCallback(
    (meetingId: string) => {
      if (sources.current.has(meetingId)) return;

      const pendingJoin = joining.current.get(meetingId);
      if (pendingJoin) {
        pendingJoin.cancelled = false;
        return;
      }

      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
      if (!baseUrl) {
        setStatuses((current) => ({ ...current, [meetingId]: 'unconfigured' }));
        return;
      }

      let url: URL;
      try {
        url = new URL(`/api/v1/meetings/${encodeURIComponent(meetingId)}/events`, baseUrl);
      } catch (error) {
        Sentry.captureException(error, {
          tags: { feature: 'meeting-sse', 'meeting.id': meetingId },
        });
        setStatuses((current) => ({ ...current, [meetingId]: 'error' }));
        return;
      }

      const attempt = { cancelled: false };
      joining.current.set(meetingId, attempt);
      setStatuses((current) => ({ ...current, [meetingId]: 'connecting' }));

      void (async () => {
        try {
          await joinMeeting(meetingId);
          if (attempt.cancelled) return;

          void queryClient.invalidateQueries({
            queryKey: getCurrentMeetingQueryKey(Number(meetingId)),
          });

          const source = new EventSource(url.toString(), { withCredentials: true });
          sources.current.set(meetingId, source);

          let opened = false;
          let hasReportedCurrentError = false;

          source.onopen = () => {
            opened = true;
            hasReportedCurrentError = false;
            reconnectedAfterClose.current.delete(meetingId);
            setStatuses((current) => ({ ...current, [meetingId]: 'connected' }));
          };

          source.addEventListener('TRANSCRIPT_CREATED', (event) => {
            receiveTranscript(meetingId, event.data);
          });

          CHAT_SSE_EVENT_TYPES.forEach((type) => {
            source.addEventListener(type, (event) => {
              if (sources.current.get(meetingId) !== source) return;
              receiveChatEvent(meetingId, type, event.data);
            });
          });

          RECORDING_SSE_EVENT_TYPES.forEach((type) => {
            source.addEventListener(type, () => {
              if (sources.current.get(meetingId) !== source) return;

              recordingListeners.emit(meetingId, type);

              if (type === 'RECORDING_COMPLETED') disconnect(meetingId);
            });
          });

          source.addEventListener('MEETING_DELETED', () => {
            if (sources.current.get(meetingId) !== source) return;

            disconnect(meetingId);
            deletedListeners.emit(meetingId);
          });

          source.onerror = () => {
            if (sources.current.get(meetingId) !== source) return;

            if (
              source.readyState === EventSource.CLOSED &&
              !reconnectedAfterClose.current.has(meetingId)
            ) {
              reconnectedAfterClose.current.add(meetingId);
              source.onopen = null;
              source.onerror = null;
              source.close();
              sources.current.delete(meetingId);
              reconnect.current(meetingId);
              return;
            }

            setStatuses((current) => ({ ...current, [meetingId]: 'error' }));

            if (hasReportedCurrentError) return;
            hasReportedCurrentError = true;
            Sentry.captureMessage('회의 SSE 연결 끊김', {
              level: 'error',
              tags: {
                feature: 'meeting-sse',
                'meeting.id': meetingId,
                'connection.phase': opened ? 'connected' : 'connecting',
                'page.visibility': document.visibilityState,
              },
            });
          };
        } catch {
          if (!attempt.cancelled) {
            setStatuses((current) => ({ ...current, [meetingId]: 'error' }));
          }
        } finally {
          if (joining.current.get(meetingId) === attempt) {
            joining.current.delete(meetingId);
          }
        }
      })();
    },
    [
      deletedListeners,
      disconnect,
      queryClient,
      receiveChatEvent,
      receiveTranscript,
      recordingListeners,
    ],
  );

  useEffect(() => {
    reconnect.current = connect;
  }, [connect]);

  useEffect(() => {
    const activeSources = sources.current;
    const pendingJoins = joining.current;
    return () => {
      pendingJoins.forEach((attempt) => {
        attempt.cancelled = true;
      });
      activeSources.forEach((source) => source.close());
      activeSources.clear();
      deletedListeners.clear();
      recordingListeners.clear();
    };
  }, [deletedListeners, recordingListeners]);

  const value = useMemo(
    () => ({
      statuses,
      transcriptsByMeetingId,
      connect,
      disconnect,
      subscribeChatEvent,
      subscribeDeleted: deletedListeners.subscribe,
      subscribeRecordingEvent: recordingListeners.subscribe,
      subscribeTranscriptCreated,
    }),
    [
      statuses,
      transcriptsByMeetingId,
      connect,
      disconnect,
      deletedListeners.subscribe,
      recordingListeners.subscribe,
      subscribeChatEvent,
      subscribeTranscriptCreated,
    ],
  );

  return <MeetingSseContext.Provider value={value}>{children}</MeetingSseContext.Provider>;
}

export function useMeetingSse() {
  const context = useContext(MeetingSseContext);
  if (!context) throw new Error('MeetingSseProvider가 필요합니다.');
  return context;
}
