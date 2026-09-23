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
import { parseTranscriptCreatedEvent, type TranscriptCreatedEventData } from './transcript-event';

export type MeetingSseStatus = 'idle' | 'unconfigured' | 'connecting' | 'connected' | 'error';

interface MeetingSseContextValue {
  statuses: Record<string, MeetingSseStatus>;
  transcriptsByMeetingId: Record<string, TranscriptCreatedEventData[]>;
  connect: (meetingId: string) => void;
  disconnect: (meetingId: string) => void;
  subscribeDeleted: (meetingId: string, listener: () => void) => () => void;
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
  const sources = useRef(new Map<string, EventSource>());
  const joining = useRef(new Map<string, { cancelled: boolean }>());
  const deletedListeners = useRef(new Map<string, Set<() => void>>());
  const transcriptListeners = useRef(
    new Map<string, Set<(transcript: TranscriptCreatedEventData) => void>>(),
  );
  const transcriptSequences = useRef(new Map<string, Set<number>>());
  const [statuses, setStatuses] = useState<Record<string, MeetingSseStatus>>({});
  const [transcriptsByMeetingId, setTranscriptsByMeetingId] = useState<
    Record<string, TranscriptCreatedEventData[]>
  >({});

  const subscribeDeleted = useCallback((meetingId: string, listener: () => void) => {
    const listeners = deletedListeners.current.get(meetingId) ?? new Set<() => void>();
    listeners.add(listener);
    deletedListeners.current.set(meetingId, listeners);

    return () => {
      listeners.delete(listener);
      if (listeners.size === 0) deletedListeners.current.delete(meetingId);
    };
  }, []);

  const subscribeTranscriptCreated = useCallback(
    (meetingId: string, listener: (transcript: TranscriptCreatedEventData) => void) => {
      const listeners =
        transcriptListeners.current.get(meetingId) ??
        new Set<(transcript: TranscriptCreatedEventData) => void>();
      listeners.add(listener);
      transcriptListeners.current.set(meetingId, listeners);

      return () => {
        listeners.delete(listener);
        if (listeners.size === 0) transcriptListeners.current.delete(meetingId);
      };
    },
    [],
  );

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
            const transcript = parseTranscriptCreatedEvent(event.data);
            if (!transcript || String(transcript.meetingId) !== meetingId) return;

            const sequences = transcriptSequences.current.get(meetingId) ?? new Set<number>();
            if (sequences.has(transcript.sequenceNumber)) return;

            sequences.add(transcript.sequenceNumber);
            transcriptSequences.current.set(meetingId, sequences);
            setTranscriptsByMeetingId((current) => ({
              ...current,
              [meetingId]: [...(current[meetingId] ?? []), transcript].sort(
                (left, right) => left.sequenceNumber - right.sequenceNumber,
              ),
            }));
            transcriptListeners.current.get(meetingId)?.forEach((listener) => listener(transcript));
          });

          source.addEventListener('MEETING_COMPLETED', () => {
            disconnect(meetingId);
          });

          source.addEventListener('MEETING_DELETED', () => {
            if (sources.current.get(meetingId) !== source) return;

            disconnect(meetingId);
            deletedListeners.current.get(meetingId)?.forEach((listener) => listener());
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
    [disconnect],
  );

  useEffect(() => {
    const activeSources = sources.current;
    const pendingJoins = joining.current;
    const activeDeletedListeners = deletedListeners.current;
    const activeTranscriptListeners = transcriptListeners.current;
    const activeTranscriptSequences = transcriptSequences.current;
    return () => {
      pendingJoins.forEach((attempt) => {
        attempt.cancelled = true;
      });
      activeSources.forEach((source) => source.close());
      activeSources.clear();
      activeDeletedListeners.clear();
      activeTranscriptListeners.clear();
      activeTranscriptSequences.clear();
    };
  }, []);

  const value = useMemo(
    () => ({
      statuses,
      transcriptsByMeetingId,
      connect,
      disconnect,
      subscribeDeleted,
      subscribeTranscriptCreated,
    }),
    [
      statuses,
      transcriptsByMeetingId,
      connect,
      disconnect,
      subscribeDeleted,
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
