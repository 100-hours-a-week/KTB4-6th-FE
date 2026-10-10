export type MeetingChatInputType = 'TEXT' | 'VOICE';

export type MeetingChatMessageStatus = 'PROCESSING' | 'COMPLETED' | 'FAILED';

interface MeetingChatCitationBase {
  meetingId: number;
  meetingTitle: string;
  meetingStartedAt: string;
}

export interface MeetingChatTranscriptCitation extends MeetingChatCitationBase {
  sourceType: 'transcript';
  segmentId: number;
  startedAtMs: number;
}

export interface MeetingChatSummaryCitation extends MeetingChatCitationBase {
  sourceType: 'summary';
  summaryId: number;
}

export type MeetingChatCitation = MeetingChatTranscriptCitation | MeetingChatSummaryCitation;

export interface MeetingChatMessageData {
  messageId: number;
  askerTeamMemberId: number;
  askerDisplayName: string;
  inputType: MeetingChatInputType;
  question: string;
  answer: string | null;
  status: MeetingChatMessageStatus;
  citations: MeetingChatCitation[] | null;
  createdAt: string;
  answeredAt: string | null;
}

export interface MeetingChatListData {
  messages: MeetingChatMessageData[];
  nextCursor: number | null;
  hasNext: boolean;
  hasAskedQuestion: boolean;
}

export type MeetingChatListErrorCode =
  | 'INVALID_CURSOR'
  | 'INVALID_PAGE_SIZE'
  | 'AUTH_REQUIRED'
  | 'INVALID_ACCESS_TOKEN'
  | 'ACCESS_TOKEN_EXPIRED'
  | 'MEETING_ACCESS_DENIED'
  | 'NO_ACTIVE_TEAM'
  | 'TEAM_ACCESS_DENIED'
  | 'MEETING_NOT_FOUND'
  | 'MEETING_NOT_IN_PROGRESS'
  | 'INTERNAL_SERVER_ERROR';

interface MeetingChatApiErrorPayload {
  code: MeetingChatListErrorCode;
  message: string;
}

export interface MeetingChatListResponse {
  success: boolean;
  data: MeetingChatListData | null;
  error: MeetingChatApiErrorPayload | null;
}
