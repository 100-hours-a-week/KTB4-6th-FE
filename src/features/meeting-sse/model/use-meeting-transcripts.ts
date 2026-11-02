'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { createListenerRegistry } from './listener-registry';
import {
  parseSpeakerMappingUpdatedEvent,
  parseTranscriptCreatedEvent,
  type TranscriptCreatedEventData,
} from './transcript-event';

export type SpeakerNames = Record<number, string | null>;

export const useMeetingTranscripts = () => {
  const [transcriptListeners] = useState(() =>
    createListenerRegistry<[TranscriptCreatedEventData]>(),
  );
  const transcriptSequences = useRef(new Map<string, Set<number>>());
  const [transcriptsByMeetingId, setTranscriptsByMeetingId] = useState<
    Record<string, TranscriptCreatedEventData[]>
  >({});
  const [speakerNamesByMeetingId, setSpeakerNamesByMeetingId] = useState<
    Record<string, SpeakerNames>
  >({});

  const updateSpeakerNames = useCallback((meetingId: string, speakerNames: SpeakerNames) => {
    setSpeakerNamesByMeetingId((current) => ({
      ...current,
      [meetingId]: { ...current[meetingId], ...speakerNames },
    }));
  }, []);

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
      if (transcript.speakerId !== null) {
        updateSpeakerNames(meetingId, { [transcript.speakerId]: transcript.speakerName });
      }
      transcriptListeners.emit(meetingId, transcript);
    },
    [transcriptListeners, updateSpeakerNames],
  );

  const receiveSpeakerMapping = useCallback(
    (meetingId: string, data: string) => {
      const event = parseSpeakerMappingUpdatedEvent(data);
      if (!event || String(event.meetingId) !== meetingId) return;

      updateSpeakerNames(
        meetingId,
        Object.fromEntries(
          event.mappings.map(({ speakerId, speakerName }) => [speakerId, speakerName]),
        ),
      );
    },
    [updateSpeakerNames],
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
    speakerNamesByMeetingId,
    subscribeTranscriptCreated: transcriptListeners.subscribe,
    receiveTranscript,
    receiveSpeakerMapping,
  };
};
