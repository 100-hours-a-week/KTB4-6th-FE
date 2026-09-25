'use client';

import { useQuery } from '@tanstack/react-query';
import { getSpeakerMapping } from '../api/get-speaker-mapping';
import { meetingKeys } from './query-keys';

interface UseSpeakerMappingOptions {
  isEnabled?: boolean;
}

/**
 * 전사 발화 하나의 발화자 연결 상태와 연결할 수 있는 참석자 목록.
 * 모달을 열 때마다 최신 상태를 보여주려고, 조회하는 화면이 닫히면 캐시를 바로 버린다.
 */
export const useSpeakerMapping = (
  meetingId: number,
  segmentId: number,
  { isEnabled = true }: UseSpeakerMappingOptions = {},
) =>
  useQuery({
    queryKey: meetingKeys.speakerMapping(meetingId, segmentId),
    queryFn: () => getSpeakerMapping(meetingId, segmentId),
    enabled: isEnabled,
    gcTime: 0,
  });
