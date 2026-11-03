import type { AssistantChatQuestionState, AssistantChatTurnData } from '@/features/assistant-chat';
import type { AssistantChatMessage, AssistantChatMessageStatus, AssistantChatPhase } from './types';

interface ConversationTurn {
  key: string;
  question: string;
  answer: string;
  status: AssistantChatMessageStatus;
  phase: AssistantChatPhase | null;
  referencedMeetingIds: number[];
  meetingDraft: AssistantChatMessage['meetingDraft'] | null;
}

const fromTurn = (turn: AssistantChatTurnData): ConversationTurn => ({
  key: String(turn.aiRequestId),
  question: turn.question,
  answer: turn.answer ?? '',
  status:
    turn.status === 'COMPLETED' ? 'completed' : turn.status === 'FAILED' ? 'failed' : 'streaming',
  phase: null,
  referencedMeetingIds: turn.referencedMeetingIds,
  meetingDraft: turn.meetingDraft,
});

const fromQuestion = (question: AssistantChatQuestionState): ConversationTurn => ({
  key: question.requestId === null ? 'pending' : String(question.requestId),
  question: question.question,
  answer: question.answer,
  status:
    question.status === 'completed' || question.status === 'failed' ? question.status : 'streaming',
  phase: question.phase,
  referencedMeetingIds: question.referencedMeetingIds,
  meetingDraft: question.meetingDraft,
});

const toMessages = (turn: ConversationTurn): AssistantChatMessage[] => [
  { id: `${turn.key}-question`, role: 'user', text: turn.question, status: 'completed' },
  {
    id: `${turn.key}-answer`,
    role: 'assistant',
    text: turn.answer,
    status: turn.status,
    phase: turn.phase ?? undefined,
    referencedMeetingIds: turn.referencedMeetingIds,
    meetingDraft: turn.meetingDraft ?? undefined,
  },
];

export const toAssistantChatMessages = (
  turns: AssistantChatTurnData[],
  currentQuestion: AssistantChatQuestionState | null,
): AssistantChatMessage[] => {
  const conversation = turns
    .filter((turn) => turn.aiRequestId !== currentQuestion?.requestId)
    .map(fromTurn);
  if (currentQuestion) conversation.push(fromQuestion(currentQuestion));

  const messages = conversation.flatMap(toMessages);
  const latestDraftId = messages.findLast((message) => message.meetingDraft)?.id;

  return messages.map((message) =>
    message.meetingDraft
      ? { ...message, meetingDraftStatus: message.id === latestDraftId ? 'pending' : 'expired' }
      : message,
  );
};
