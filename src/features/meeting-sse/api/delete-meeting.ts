import { apiClient } from '@/shared/api';

/** 회의를 삭제한다. 성공하면 본문 없이 204로 응답한다. */
export async function deleteMeeting(meetingId: string | number): Promise<void> {
  await apiClient.delete(`/api/v1/meetings/${encodeURIComponent(meetingId)}`);
}
