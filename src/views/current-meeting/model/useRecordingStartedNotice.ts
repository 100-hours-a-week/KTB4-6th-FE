'use client';

import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useMeetingSse } from '@/features/meeting-sse';
import { useRecordingSessionStore } from '@/features/recording';
import { getCurrentMeetingQueryKey } from './current-meeting-query-key';

interface UseRecordingStartedNoticeParams {
  meetingId: number;
  isPreview: boolean;
}

/**
 * 다른 참여자가 녹음을 시작했다는 SSE 이벤트를 받으면 회의 상태를 갱신하고 안내 모달을 연다.
 * 이 브라우저가 녹음을 시작하는 중이거나 시작한 경우에는 안내하지 않는다.
 */
export const useRecordingStartedNotice = ({
  meetingId,
  isPreview,
}: UseRecordingStartedNoticeParams) => {
  const queryClient = useQueryClient();
  const { subscribeRecordingStarted } = useMeetingSse();
  const [isRecordingStartedNoticeOpen, setIsRecordingStartedNoticeOpen] = useState(false);

  useEffect(() => {
    if (isPreview) return;

    return subscribeRecordingStarted(String(meetingId), () => {
      void queryClient.invalidateQueries({ queryKey: getCurrentMeetingQueryKey(meetingId) });

      const { activeRecording, operation } = useRecordingSessionStore.getState();
      const isOwnRecording = operation === 'starting' || activeRecording?.meetingId === meetingId;
      if (!isOwnRecording) setIsRecordingStartedNoticeOpen(true);
    });
  }, [isPreview, meetingId, queryClient, subscribeRecordingStarted]);

  return { isRecordingStartedNoticeOpen, setIsRecordingStartedNoticeOpen };
};
