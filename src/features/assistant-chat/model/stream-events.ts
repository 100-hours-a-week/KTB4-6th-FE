import type { SseEvent } from '@/shared/api';
import type {
  AssistantChatFailureCode,
  AssistantChatMeetingDraftData,
  AssistantChatPhase,
  AssistantChatRequestStatus,
  AssistantChatStreamEvent,
} from './types';

interface AssistantChatStreamPayload {
  aiRequestId?: number;
  status?: AssistantChatRequestStatus;
  phase?: AssistantChatPhase;
  text?: string;
  answer?: string;
  referencedMeetingIds?: number[];
  meetingDraft?: AssistantChatMeetingDraftData | null;
  code?: AssistantChatFailureCode;
}

const parsePayload = (data: string): AssistantChatStreamPayload | null => {
  try {
    const payload: unknown = JSON.parse(data);
    return typeof payload === 'object' && payload !== null
      ? (payload as AssistantChatStreamPayload)
      : null;
  } catch {
    return null;
  }
};

export const toAssistantChatStreamEvent = ({
  event,
  data,
}: SseEvent): AssistantChatStreamEvent | null => {
  const payload = parsePayload(data);
  if (!payload) return null;

  switch (event) {
    case 'status':
      if (payload.phase) return { type: 'phase', phase: payload.phase };
      if (payload.status && typeof payload.aiRequestId === 'number') {
        return { type: 'status', aiRequestId: payload.aiRequestId, status: payload.status };
      }
      return null;
    case 'delta':
      return typeof payload.text === 'string' ? { type: 'delta', text: payload.text } : null;
    case 'completed':
      return typeof payload.answer === 'string'
        ? {
            type: 'completed',
            answer: payload.answer,
            referencedMeetingIds: payload.referencedMeetingIds ?? [],
            meetingDraft: payload.meetingDraft ?? null,
          }
        : null;
    case 'failed':
      return { type: 'failed', failureCode: payload.code ?? null };
    default:
      return null;
  }
};
