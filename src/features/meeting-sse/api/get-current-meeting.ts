import axios from 'axios';
import { apiClient } from '@/shared/api';

interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error: { code?: string } | null;
}

interface MeetingDetailData {
  title: string;
  purpose: string;
  note: string;
  /** 예정 시작 시각. 시간대 표기 없이 오는 서버 시각이다. 수정 화면에는 아직 반영하지 않는다(V2) */
  scheduledAt: string;
  targetDurationMinutes: number;
  status: 'WAITING' | 'IN_PROGRESS' | 'COMPLETED';
  createdByTeamMemberId: number;
}

interface MeetingParticipantListData {
  participantsCount: number;
  participants: Array<{ teamMemberId: number; displayName: string }>;
}

interface ActiveRecordingData {
  recordingSessionId: number;
  startedByTeamMemberId: number;
  status: 'RECORDING' | 'PAUSED';
  startedAt: string;
  pausedAt: string | null;
  totalPausedDurationMs: number;
  endedAt: string | null;
}

export interface CurrentMeetingState {
  title: string;
  purpose: string;
  note: string;
  targetMinutes: number;
  participantCount: number;
  recorderName: string;
  meetingStatus: MeetingDetailData['status'];
  recordingStatus: ActiveRecordingData['status'] | null;
  recordingStartedAt: string | null;
  recordingPausedAt: string | null;
  recordingTotalPausedDurationMs: number | null;
  recordingEndedAt: string | null;
  recordingStartedByTeamMemberId: number | null;
  recordingSessionId: number | null;
  createdByTeamMemberId: number;
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
    purpose: meeting.purpose,
    note: meeting.note,
    targetMinutes: meeting.targetDurationMinutes,
    participantCount: participantList.participantsCount,
    recorderName,
    meetingStatus: meeting.status,
    recordingStatus: activeRecording?.status ?? null,
    recordingStartedAt: activeRecording?.startedAt ?? null,
    recordingPausedAt: activeRecording?.pausedAt ?? null,
    recordingTotalPausedDurationMs: activeRecording?.totalPausedDurationMs ?? null,
    recordingEndedAt: activeRecording?.endedAt ?? null,
    recordingStartedByTeamMemberId: activeRecording?.startedByTeamMemberId ?? null,
    recordingSessionId: activeRecording?.recordingSessionId ?? null,
    createdByTeamMemberId: meeting.createdByTeamMemberId,
  };
};
