'use client';

import { useMemo } from 'react';
import { useSpeakerMapping } from '@/features/meeting';
import { toSpeakerLinkDialogData, type SpeakerLinkDialogData } from './map-speaker-mapping';
import type { TranscriptEntry } from './preview-meeting-transcript';
import { mockTeamMembers } from './preview-team-members';

interface UseSpeakerLinkDataParams {
  meetingId: number;
  entry: TranscriptEntry;
  /** 개발 환경 전용 미리보기이면 조회하지 않고 목데이터로 모달을 채운다. */
  isPreview: boolean;
}

/** 발화자 연결 모달이 그릴 데이터를 발화자 매핑 조회 결과(또는 개발용 미리보기)로 정한다. */
export const useSpeakerLinkData = ({ meetingId, entry, isPreview }: UseSpeakerLinkDataParams) => {
  const mappingQuery = useSpeakerMapping(meetingId, Number(entry.id), { isEnabled: !isPreview });
  const fetchedData = useMemo(
    () => (mappingQuery.data ? toSpeakerLinkDialogData(mappingQuery.data) : null),
    [mappingQuery.data],
  );
  const retry = () => void mappingQuery.refetch();

  if (isPreview) {
    const previewData: SpeakerLinkDialogData = {
      speakerId: 0,
      speakerLabel: entry.speakerName,
      members: mockTeamMembers,
      currentLink: entry.isSpeakerLinked
        ? { name: entry.speakerName, memberId: entry.linkedMemberId }
        : null,
    };
    return { status: 'ready' as const, data: previewData, retry };
  }
  if (fetchedData) return { status: 'ready' as const, data: fetchedData, retry };
  if (mappingQuery.isPending) return { status: 'loading' as const, data: null, retry };

  return { status: 'error' as const, data: null, retry };
};
