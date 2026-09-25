'use client';

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useMeetingSse } from '@/features/meeting-sse';
import { getCurrentMeetingQueryKey } from './current-meeting-query-key';

interface UseRecordingStatusSyncParams {
  meetingId: number;
  isPreview: boolean;
}

/**
 * 녹음 시작·일시정지·재개·종료 이벤트를 받으면 회의 상태를 다시 조회한다.
 * 참여자 화면의 진행 단계, 진행자 안내 문구, 종료 회의 화면 분기가 이 조회 결과를 따른다.
 */
export const useRecordingStatusSync = ({ meetingId, isPreview }: UseRecordingStatusSyncParams) => {
  const queryClient = useQueryClient();
  const { subscribeRecordingEvent } = useMeetingSse();

  useEffect(() => {
    if (isPreview) return;

    return subscribeRecordingEvent(String(meetingId), () => {
      void queryClient.invalidateQueries({ queryKey: getCurrentMeetingQueryKey(meetingId) });
    });
  }, [isPreview, meetingId, queryClient, subscribeRecordingEvent]);
};
