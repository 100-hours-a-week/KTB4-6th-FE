import { apiClient } from '@/shared/api';

export async function deleteMeeting(meetingId: string): Promise<void> {
  await apiClient.delete(`/api/v1/meetings/${encodeURIComponent(meetingId)}`);
}
