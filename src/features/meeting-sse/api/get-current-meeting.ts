import axios from 'axios';
import { apiClient } from '@/shared/api';

interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error: { code?: string } | null;
}

interface MeetingDetailData {
  title: string;
  targetDurationMinutes: number;
  status: 'WAITING' | 'IN_PROGRESS' | 'COMPLETED';
}

interface MeetingParticipantListData {
  participantsCount: number;
  participants: Array<{ teamMemberId: number; displayName: string }>;
}

interface ActiveRecordingData {
  startedByTeamMemberId: number;
  status: 'RECORDING' | 'PAUSED';
}

export interface CurrentMeetingState {
  title: string;
  targetMinutes: number;
  participantCount: number;
  recorderName: string;
  meetingStatus: MeetingDetailData['status'];
  recordingStatus: ActiveRecordingData['status'] | null;
}

const unwrap = <T>(response: ApiResponse<T>, message: string): T => {
  if (!response.success || !response.data) throw new Error(message);
  return response.data;
};

const getMeeting = async (meetingId: number) => {
  const response = await apiClient.get<ApiResponse<MeetingDetailData>>(
    `/api/v1/meetings/${meetingId}`,
  );
  return unwrap(response.data, '회의 정보를 불러오지 못했습니다.');
};

const getParticipants = async (meetingId: number) => {
  const response = await apiClient.get<ApiResponse<MeetingParticipantListData>>(
    `/api/v1/meetings/${meetingId}/participants`,
  );
  return unwrap(response.data, '회의 참여자 정보를 불러오지 못했습니다.');
};

const getActiveRecording = async (meetingId: number): Promise<ActiveRecordingData | null> => {
  try {
    const response = await apiClient.get<ApiResponse<ActiveRecordingData>>(
      `/api/v1/meetings/${meetingId}/recording`,
    );
    return unwrap(response.data, '활성 녹음 정보를 불러오지 못했습니다.');
  } catch (error) {
    if (
      axios.isAxiosError<ApiResponse<never>>(error) &&
      error.response?.status === 404 &&
      error.response.data.error?.code === 'RECORDING_SESSION_NOT_FOUND'
    ) {
      return null;
    }
    throw error;
  }
};

export const getCurrentMeetingState = async (meetingId: number): Promise<CurrentMeetingState> => {
  const [meeting, participantList] = await Promise.all([
    getMeeting(meetingId),
    getParticipants(meetingId),
  ]);
  const activeRecording =
    meeting.status === 'IN_PROGRESS' ? await getActiveRecording(meetingId) : null;

  const recorderName = activeRecording
    ? (participantList.participants.find(
        (participant) => participant.teamMemberId === activeRecording.startedByTeamMemberId,
      )?.displayName ?? '다른 참여자')
    : '';

  return {
    title: meeting.title,
    targetMinutes: meeting.targetDurationMinutes,
    participantCount: participantList.participantsCount,
    recorderName,
    meetingStatus: meeting.status,
    recordingStatus: activeRecording?.status ?? null,
  };
};
