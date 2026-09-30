'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { createListenerRegistry } from './listener-registry';
import { parseTranscriptCreatedEvent, type TranscriptCreatedEventData } from './transcript-event';

/**
 * 실시간 전사 이벤트를 회의별 목록으로 쌓는다.
 * 순번이 같은 전사는 한 번만 넣고, 순번 순서로 정렬하며, 새 전사는 구독자에게도 알린다.
 */
export const useMeetingTranscripts = () => {
  const [transcriptListeners] = useState(() =>
    createListenerRegistry<[TranscriptCreatedEventData]>(),
  );
  const transcriptSequences = useRef(new Map<string, Set<number>>());
  const [transcriptsByMeetingId, setTranscriptsByMeetingId] = useState<
    Record<string, TranscriptCreatedEventData[]>
  >({});

  const receiveTranscript = useCallback(
    (meetingId: string, data: string) => {
      const transcript = parseTranscriptCreatedEvent(data);
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
      transcriptListeners.emit(meetingId, transcript);
    },
    [transcriptListeners],
  );

  useEffect(() => {
    const activeSequences = transcriptSequences.current;
    return () => {
      activeSequences.clear();
      transcriptListeners.clear();
    };
  }, [transcriptListeners]);

  return {
    transcriptsByMeetingId,
    subscribeTranscriptCreated: transcriptListeners.subscribe,
    receiveTranscript,
  };
};
