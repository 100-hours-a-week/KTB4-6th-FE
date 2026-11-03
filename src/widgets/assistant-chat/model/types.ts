export type AssistantChatMessageRole = 'user' | 'assistant';

export type AssistantChatMessageStatus = 'streaming' | 'completed' | 'failed';

export type AssistantChatMeetingDraftStatus =
  'pending' | 'sending' | 'confirmed' | 'cancelled' | 'expired' | 'failed';

export type AssistantChatHistoryStatus = 'loading' | 'error' | 'ready';

export type AssistantChatPhase = 'SEARCHING_MEETINGS' | 'READING_MEETING' | 'PREPARING_MEETING';

export interface AssistantChatMeetingDraft {
  title: string;
  purpose: string;
  note: string | null;
  targetDurationMinutes: number;
  attendeeTeamMemberIds: number[];
  customAttendeeNames: string[];
  scheduledAt: string;
}

export interface AssistantChatMessage {
  id: string;
  role: AssistantChatMessageRole;
  text: string;
  status: AssistantChatMessageStatus;
  phase?: AssistantChatPhase;
  meetingDraft?: AssistantChatMeetingDraft;
  meetingDraftStatus?: AssistantChatMeetingDraftStatus;
  referencedMeetingIds?: number[];
  createdMeetingId?: number;
}
