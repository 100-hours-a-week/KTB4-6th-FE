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
import { joinMeeting } from '../api/join-meeting';
import { createListenerRegistry } from './listener-registry';
import { RECORDING_SSE_EVENT_TYPES, type RecordingSseEventType } from './recording-event';
import type { TranscriptCreatedEventData } from './transcript-event';
import { useMeetingTranscripts } from './use-meeting-transcripts';

export type MeetingSseStatus = 'idle' | 'unconfigured' | 'connecting' | 'connected' | 'error';

interface MeetingSseContextValue {
  statuses: Record<string, MeetingSseStatus>;
  transcriptsByMeetingId: Record<string, TranscriptCreatedEventData[]>;
  connect: (meetingId: string) => void;
  disconnect: (meetingId: string) => void;
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

/** 회의별 SSE 연결 수명 주기와 연결 상태를 관리하고, 수신한 이벤트를 전사 훅과 구독자에게 넘긴다. */
export function MeetingSseProvider({ children }: MeetingSseProviderProps) {
  const sources = useRef(new Map<string, EventSource>());
  const joining = useRef(new Map<string, { cancelled: boolean }>());
  const [deletedListeners] = useState(() => createListenerRegistry());
  const [recordingListeners] = useState(() => createListenerRegistry<[RecordingSseEventType]>());
  const [statuses, setStatuses] = useState<Record<string, MeetingSseStatus>>({});
  const { transcriptsByMeetingId, subscribeTranscriptCreated, receiveTranscript } =
    useMeetingTranscripts();

  const disconnect = useCallback((meetingId: string) => {
    const pendingJoin = joining.current.get(meetingId);
    if (pendingJoin) {
      pendingJoin.cancelled = true;
      joining.current.delete(meetingId);
    }

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
      } catch {
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

          const source = new EventSource(url.toString(), { withCredentials: true });
          sources.current.set(meetingId, source);

          source.onopen = () => {
            setStatuses((current) => ({ ...current, [meetingId]: 'connected' }));
          };

          source.addEventListener('TRANSCRIPT_CREATED', (event) => {
            receiveTranscript(meetingId, event.data);
          });

          // 연결이 회의 단위라 페이로드 없이 어떤 이벤트인지만 알린다.
          RECORDING_SSE_EVENT_TYPES.forEach((type) => {
            source.addEventListener(type, () => {
              if (sources.current.get(meetingId) !== source) return;

              recordingListeners.emit(meetingId, type);

              // 서버는 종료 이벤트를 보낸 뒤 연결을 닫는다. 연결 오류로 보이지 않도록 먼저 정리한다.
              if (type === 'RECORDING_COMPLETED') disconnect(meetingId);
            });
          });

          source.addEventListener('MEETING_DELETED', () => {
            if (sources.current.get(meetingId) !== source) return;

            disconnect(meetingId);
            deletedListeners.emit(meetingId);
          });

          source.onerror = () => {
            // EventSource의 자동 재연결은 이번 작업 범위에 포함하지 않는다.
            source.close();
            sources.current.delete(meetingId);
            setStatuses((current) => ({ ...current, [meetingId]: 'error' }));
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
    [deletedListeners, disconnect, receiveTranscript, recordingListeners],
  );

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
