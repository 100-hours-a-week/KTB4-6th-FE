import { apiClient } from '@/shared/api';

export async function leaveMeeting(meetingId: string): Promise<void> {
  await apiClient.delete(`/api/v1/meetings/${encodeURIComponent(meetingId)}/participants/me`);
}
