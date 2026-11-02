export type AssistantChatMessageRole = 'user' | 'assistant';

export type AssistantChatMessageStatus = 'streaming' | 'completed' | 'failed';

export type AssistantChatMeetingDraftStatus =
  'pending' | 'sending' | 'confirmed' | 'expired' | 'failed';

export type AssistantChatHistoryStatus = 'loading' | 'error' | 'ready';

export type AssistantChatPhase = 'SEARCHING_MEETINGS' | 'READING_MEETING' | 'PREPARING_MEETING';

export interface AssistantChatMessage {
  id: string;
  role: AssistantChatMessageRole;
  text: string;
  status: AssistantChatMessageStatus;
  phase?: AssistantChatPhase;
  meetingDraftStatus?: AssistantChatMeetingDraftStatus;
  createdMeetingId?: number;
}
