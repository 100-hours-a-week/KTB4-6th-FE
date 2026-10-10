'use client';

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getCurrentMeetingQueryKey, useMeetingSse } from '@/features/meeting-sse';

/**
 * 녹음 시작·일시정지·재개·종료 이벤트를 받으면 회의 상태를 다시 조회한다.
 * 참여자 화면의 진행 단계, 진행자 안내 문구, 종료 회의 화면 분기가 이 조회 결과를 따른다.
 */
export const useRecordingStatusSync = (meetingId: number) => {
  const queryClient = useQueryClient();
  const { subscribeRecordingEvent } = useMeetingSse();

  useEffect(() => {
    return subscribeRecordingEvent(String(meetingId), () => {
      void queryClient.invalidateQueries({ queryKey: getCurrentMeetingQueryKey(meetingId) });
    });
  }, [meetingId, queryClient, subscribeRecordingEvent]);
};
