'use client';

import { useEffect, useState } from 'react';
import { useMeetingSse } from '@/features/meeting-sse';
import { useRecordingSessionStore } from '@/features/recording';

interface UseRecordingStartedNoticeParams {
  meetingId: number;
  isPreview: boolean;
}

/**
 * 다른 참여자가 녹음을 시작했다는 SSE 이벤트를 받으면 안내 모달을 연다.
 * 이 브라우저가 녹음을 시작하는 중이거나 시작한 경우에는 안내하지 않는다.
 */
export const useRecordingStartedNotice = ({
  meetingId,
  isPreview,
}: UseRecordingStartedNoticeParams) => {
  const { subscribeRecordingEvent } = useMeetingSse();
  const [isRecordingStartedNoticeOpen, setIsRecordingStartedNoticeOpen] = useState(false);

  useEffect(() => {
    if (isPreview) return;

    return subscribeRecordingEvent(String(meetingId), (type) => {
      if (type !== 'RECORDING_STARTED') return;

      const { activeRecording, operation } = useRecordingSessionStore.getState();
      const isOwnRecording = operation === 'starting' || activeRecording?.meetingId === meetingId;
      if (!isOwnRecording) setIsRecordingStartedNoticeOpen(true);
    });
  }, [isPreview, meetingId, subscribeRecordingEvent]);

  return { isRecordingStartedNoticeOpen, setIsRecordingStartedNoticeOpen };
};
