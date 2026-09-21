'use client';

import { useEffect } from 'react';
import { useMeetingSse } from '../model/meeting-sse-provider';

interface MeetingSseConnectionProps {
  meetingId: string;
}

export function MeetingSseConnection({ meetingId }: MeetingSseConnectionProps) {
  const { connect } = useMeetingSse();

  useEffect(() => {
    connect(meetingId);
    // 페이지 이동은 회의 나가기가 아니므로 여기서 연결을 닫지 않는다.
  }, [connect, meetingId]);

  return null;
}
