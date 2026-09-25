export interface ApiErrorPayload {
  code: string;
  message: string;
}

export interface CreateMeetingRequest {
  title: string;
  purpose: string;
  note: string;
  targetDurationMinutes: number;
}

export interface CreateMeetingData {
  meetingId: number;
  teamId: number;
  createdByTeamMemberId: number;
  title: string;
  purpose: string;
  note: string;
  scheduledAt: string;
  targetDurationMinutes: number;
  status: 'WAITING' | 'IN_PROGRESS' | 'COMPLETED';
  createdAt: string;
}

export interface CreateMeetingResponse {
  success: boolean;
  data: CreateMeetingData | null;
  error: ApiErrorPayload | null;
}

export interface MeetingSummaryData {
  summaryId: number;
  /** 요약 본문(Markdown). 생성 중이거나 실패했으면 null */
  content: string | null;
  /** 재생성 회차 */
  version: number;
  /** 생성 상태. 알려진 값은 COMPLETED, FAILED이고 그 외는 생성 중으로 본다 */
  status: string;
  createdAt: string;
}

export interface MeetingSummaryResponse {
  success: boolean;
  data: MeetingSummaryData | null;
  error: ApiErrorPayload | null;
}

export interface RequestMeetingSummaryRequest {
  /** 요약을 다시 만드는 사유 */
  reason: string;
}

export interface MeetingSummaryRequestData {
  summaryId: number;
  /** 이 회의의 요약 회차 */
  version: number;
  status: string;
  /** 요청으로 크레딧이 차감된 뒤의 팀 크레딧 잔액 */
  creditBalance: number;
}

export interface MeetingSummaryRequestResponse {
  success: boolean;
  data: MeetingSummaryRequestData | null;
  error: ApiErrorPayload | null;
}

export interface MeetingTranscriptSegmentData {
  segmentId: number;
  /** 화면에 보여줄 발화자 이름. 팀원 연결이면 멤버 이름, 별칭 연결이면 별칭, 미연결이면 `화자 1` 같은 이름 */
  speakerDisplayName: string;
  /** 회의 안에서의 발화 순서 */
  sequenceNumber: number;
  content: string;
  /** 음성 파일 시작을 기준으로 이 발화가 시작된 시각(ms) */
  startedAtMs: number;
  endedAtMs: number;
  recognizedAt: string;
}

export interface MeetingTranscriptResponse {
  success: boolean;
  data: { segments: MeetingTranscriptSegmentData[] } | null;
  error: ApiErrorPayload | null;
}

/** 발화자가 어떻게 연결되어 있는지. TEAM_MEMBER는 팀 멤버, CUSTOM_ALIAS는 직접 입력한 별칭, NONE은 연결되지 않음 */
export type SpeakerMappingType = 'TEAM_MEMBER' | 'CUSTOM_ALIAS' | 'NONE';

export interface SpeakerMappingSpeakerData {
  transcriptSpeakerId: number;
  /** 연결되지 않았을 때 쓰는 이름 (`화자 1`) */
  speakerLabel: string;
  /** 현재 화면에 보여주는 이름 (멤버 이름, 별칭, 또는 `화자 1`) */
  displayName: string;
  mappingType: SpeakerMappingType;
  /** mappingType이 TEAM_MEMBER일 때 연결된 팀 멤버 ID */
  mappedTeamMemberId: number | null;
  /** mappingType이 CUSTOM_ALIAS일 때 직접 입력한 별칭 */
  customAlias: string | null;
}

export interface SpeakerMappingParticipantData {
  teamMemberId: number;
  nickname: string;
}

export interface SpeakerMappingData {
  speaker: SpeakerMappingSpeakerData;
  /** 발화자에 연결할 수 있는 회의 참석자 목록 */
  participants: SpeakerMappingParticipantData[];
}

export interface SpeakerMappingResponse {
  success: boolean;
  data: SpeakerMappingData | null;
  error: ApiErrorPayload | null;
}

/** 발화자 연결 요청. teamMemberId와 customAlias 중 하나만 값을 넣고, 둘 다 null이면 연결을 해제한다. */
export interface UpdateSpeakerMappingRequest {
  teamMemberId: number | null;
  customAlias: string | null;
}

export interface SpeakerMappingResultData {
  transcriptSpeakerId: number;
  speakerLabel: string;
  mappedTeamMemberId: number | null;
  customAlias: string | null;
}

export interface UpdateSpeakerMappingResponse {
  success: boolean;
  data: SpeakerMappingResultData | null;
  error: ApiErrorPayload | null;
}

/** 음성 파일 상태. 재생할 수 있는 것은 AVAILABLE뿐이다. */
export type AudioFileStatus =
  'UPLOADING' | 'AVAILABLE' | 'UPLOAD_FAILED' | 'DELETE_PENDING' | 'DELETED' | 'DELETE_FAILED';

export interface AudioFileData {
  audioFileId: number;
  recordingSessionId: number;
  contentType: string;
  fileSizeBytes: number;
  durationMs: number;
  status: AudioFileStatus;
  /** 음성 파일을 저장한 시각 */
  storedAt: string;
  /** 음성 파일이 만료되는 시각 */
  expiresAt: string;
}

export interface AudioFileResponse {
  success: boolean;
  data: AudioFileData | null;
  error: ApiErrorPayload | null;
}

export interface AudioDownloadUrlData {
  /** 음성 파일을 내려받는 임시 주소(프리사인드 URL) */
  downloadUrl: string;
  /** 임시 주소가 만료되는 시각. 이후에는 재생·탐색 요청이 실패한다. */
  downloadUrlExpiresAt: string;
}

export interface AudioDownloadUrlResponse {
  success: boolean;
  data: AudioDownloadUrlData | null;
  error: ApiErrorPayload | null;
}
