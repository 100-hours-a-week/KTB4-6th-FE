'use client';

import { deleteMeeting } from '../api/delete-meeting';
import { leaveMeeting } from '../api/leave-meeting';
import { useMeetingSse } from './meeting-sse-provider';

export function useMeetingExit(meetingId: string) {
  const { disconnect } = useMeetingSse();

  const leave = async () => {
    await leaveMeeting(meetingId);
    disconnect(meetingId);
  };

  const remove = async () => {
    await deleteMeeting(meetingId);
    disconnect(meetingId);
  };

  return { leave, remove };
}
