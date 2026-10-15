export interface CurrentMeetingDetailData {
  title: string;
  purpose: string;
  note: string | null;
  /** 예정 시작 시각. 시간대 표기 없이 오는 서버 시각이다. 수정 화면에는 아직 반영하지 않는다(V2) */
  scheduledAt: string;
  targetDurationMinutes: number;
  status: 'WAITING' | 'IN_PROGRESS' | 'COMPLETED';
  createdByTeamMemberId: number;
}

export interface MeetingParticipantListData {
  participantsCount: number;
  participants: Array<{ teamMemberId: number; displayName: string }>;
}

export interface ActiveRecordingData {
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
  meetingStatus: CurrentMeetingDetailData['status'];
  recordingStatus: ActiveRecordingData['status'] | null;
  recordingStartedAt: string | null;
  recordingPausedAt: string | null;
  recordingTotalPausedDurationMs: number | null;
  recordingEndedAt: string | null;
  recordingStartedByTeamMemberId: number | null;
  recordingSessionId: number | null;
  createdByTeamMemberId: number;
}

export const toCurrentMeetingState = (
  meeting: CurrentMeetingDetailData,
  participantList: MeetingParticipantListData,
  activeRecording: ActiveRecordingData | null,
): CurrentMeetingState => {
  const recorderName = activeRecording
    ? (participantList.participants.find(
        (participant) => participant.teamMemberId === activeRecording.startedByTeamMemberId,
      )?.displayName ?? '다른 참여자')
    : '';

  return {
    title: meeting.title,
    purpose: meeting.purpose,
    note: meeting.note ?? '',
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
