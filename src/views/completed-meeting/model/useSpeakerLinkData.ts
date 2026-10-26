'use client';

import { useMemo } from 'react';
import { useSpeakerMapping } from '@/features/meeting';
import { toSpeakerLinkDialogData } from './map-speaker-mapping';
import type { TranscriptEntry } from './types';

interface UseSpeakerLinkDataParams {
  meetingId: number;
  entry: TranscriptEntry;
}

/** 발화자 연결 모달이 그릴 데이터를 발화자 매핑 조회 결과로 정한다. */
export const useSpeakerLinkData = ({ meetingId, entry }: UseSpeakerLinkDataParams) => {
  const mappingQuery = useSpeakerMapping(meetingId, Number(entry.id));
  const fetchedData = useMemo(
    () => (mappingQuery.data ? toSpeakerLinkDialogData(mappingQuery.data) : null),
    [mappingQuery.data],
  );
  const retry = () => void mappingQuery.refetch();

  if (fetchedData) return { status: 'ready' as const, data: fetchedData, retry };
  if (mappingQuery.isPending) return { status: 'loading' as const, data: null, retry };

  return { status: 'error' as const, data: null, retry };
};
