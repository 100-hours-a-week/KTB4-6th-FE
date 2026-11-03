import type { AssistantChatApiError } from './errors';

export type AssistantChatRequestStatus = 'ACCEPTED' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

export type AssistantChatPhase = 'SEARCHING_MEETINGS' | 'READING_MEETING' | 'PREPARING_MEETING';

export type AssistantChatFailureCode =
  | 'invalid_request'
  | 'forbidden'
  | 'timeout'
  | 'retrieval_failed'
  | 'generation_failed'
  | 'execution_limit_exceeded';

export type AssistantChatErrorCode =
  | 'INVALID_IDEMPOTENCY_KEY'
  | 'IDEMPOTENCY_KEY_REUSED'
  | 'ASSISTANT_CHAT_ACCESS_DENIED'
  | 'ASSISTANT_CHAT_ALREADY_PROCESSING'
  | 'AUTH_REQUIRED'
  | 'INVALID_ACCESS_TOKEN'
  | 'ACCESS_TOKEN_EXPIRED'
  | 'INTERNAL_SERVER_ERROR';

export interface AssistantChatMeetingDraftData {
  title: string;
  purpose: string;
  note: string | null;
  targetDurationMinutes: number;
  attendeeTeamMemberIds: number[];
  customAttendeeNames: string[];
  scheduledAt: string;
}

export interface AssistantChatTurnData {
  aiRequestId: number;
  messageId: number;
  question: string;
  answer: string | null;
  status: AssistantChatRequestStatus;
  failureCode: AssistantChatFailureCode | null;
  meetingDraft: AssistantChatMeetingDraftData | null;
  referencedMeetingIds: number[];
  createdAt: string;
  updatedAt: string;
}

export interface AssistantChatTurnListData {
  messages: AssistantChatTurnData[];
  nextCursor: number | null;
  hasNext: boolean;
}

export type AssistantChatStreamEvent =
  | { type: 'status'; aiRequestId: number; status: AssistantChatRequestStatus }
  | { type: 'phase'; phase: AssistantChatPhase }
  | { type: 'delta'; text: string }
  | {
      type: 'completed';
      answer: string;
      referencedMeetingIds: number[];
      meetingDraft: AssistantChatMeetingDraftData | null;
    }
  | { type: 'failed'; failureCode: AssistantChatFailureCode | null };

export interface AssistantChatStream {
  requestId: number | null;
  events: AsyncGenerator<AssistantChatStreamEvent, void, undefined>;
}

export interface PostAssistantChatQuestionParams {
  teamId: number;
  question: string;
  idempotencyKey: string;
}

export type AssistantChatQuestionStatus = 'sending' | 'streaming' | 'completed' | 'failed';

export interface AssistantChatQuestionState {
  requestId: number | null;
  question: string;
  status: AssistantChatQuestionStatus;
  phase: AssistantChatPhase | null;
  answer: string;
  referencedMeetingIds: number[];
  meetingDraft: AssistantChatMeetingDraftData | null;
  failureCode: AssistantChatFailureCode | null;
  error: AssistantChatApiError | null;
}

interface AssistantChatApiErrorPayload {
  code: AssistantChatErrorCode;
  message: string;
}

export interface AssistantChatTurnListResponse {
  success: boolean;
  data: AssistantChatTurnListData | null;
  error: AssistantChatApiErrorPayload | null;
}

export interface AssistantChatTurnResponse {
  success: boolean;
  data: AssistantChatTurnData | null;
  error: AssistantChatApiErrorPayload | null;
}
