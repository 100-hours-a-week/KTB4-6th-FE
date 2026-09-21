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

export type MeetingSseStatus = 'idle' | 'unconfigured' | 'connecting' | 'connected' | 'error';

interface MeetingSseContextValue {
  statuses: Record<string, MeetingSseStatus>;
  connect: (meetingId: string) => void;
  disconnect: (meetingId: string) => void;
}

const MeetingSseContext = createContext<MeetingSseContextValue | null>(null);

interface MeetingSseProviderProps {
  children: ReactNode;
}

export function MeetingSseProvider({ children }: MeetingSseProviderProps) {
  const sources = useRef(new Map<string, EventSource>());
  const [statuses, setStatuses] = useState<Record<string, MeetingSseStatus>>({});

  const disconnect = useCallback((meetingId: string) => {
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

      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
      if (!baseUrl) {
        setStatuses((current) => ({ ...current, [meetingId]: 'unconfigured' }));
        return;
      }

      try {
        const url = new URL(`/api/v1/meetings/${encodeURIComponent(meetingId)}/events`, baseUrl);
        const source = new EventSource(url.toString(), { withCredentials: true });
        sources.current.set(meetingId, source);
        setStatuses((current) => ({ ...current, [meetingId]: 'connecting' }));

        source.onopen = () => {
          setStatuses((current) => ({ ...current, [meetingId]: 'connected' }));
        };

        source.addEventListener('MEETING_COMPLETED', () => {
          disconnect(meetingId);
        });

        source.onerror = () => {
          // EventSource의 자동 재연결은 이번 작업 범위에 포함하지 않는다.
          source.close();
          sources.current.delete(meetingId);
          setStatuses((current) => ({ ...current, [meetingId]: 'error' }));
        };
      } catch {
        setStatuses((current) => ({ ...current, [meetingId]: 'error' }));
      }
    },
    [disconnect],
  );

  useEffect(() => {
    const activeSources = sources.current;
    return () => {
      activeSources.forEach((source) => source.close());
      activeSources.clear();
    };
  }, []);

  const value = useMemo(() => ({ statuses, connect, disconnect }), [statuses, connect, disconnect]);

  return <MeetingSseContext.Provider value={value}>{children}</MeetingSseContext.Provider>;
}

export function useMeetingSse() {
  const context = useContext(MeetingSseContext);
  if (!context) throw new Error('MeetingSseProvider가 필요합니다.');
  return context;
}
