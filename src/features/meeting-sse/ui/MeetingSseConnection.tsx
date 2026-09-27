'use client';

import { useEffect } from 'react';
import { useMeetingSse } from '../model/meeting-sse-provider';

interface MeetingSseConnectionProps {
  meetingId: string;
  onMeetingDeleted: () => void;
}

export function MeetingSseConnection({ meetingId, onMeetingDeleted }: MeetingSseConnectionProps) {
  const { connect, subscribeDeleted } = useMeetingSse();

  useEffect(() => {
    connect(meetingId);
  }, [connect, meetingId]);

  useEffect(() => {
    // 페이지 이동은 회의 나가기가 아니므로 여기서 연결을 닫지 않는다.
    return subscribeDeleted(meetingId, onMeetingDeleted);
  }, [meetingId, onMeetingDeleted, subscribeDeleted]);

  return null;
}
