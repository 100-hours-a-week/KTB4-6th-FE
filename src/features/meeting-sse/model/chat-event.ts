export const CHAT_SSE_EVENT_TYPES = ['CHAT_REQUESTED', 'CHAT_COMPLETED', 'CHAT_FAILED'] as const;

export type ChatSseEventType = (typeof CHAT_SSE_EVENT_TYPES)[number];

interface ChatCitationBase {
  meetingId: number;
  meetingTitle: string;
  meetingStartedAt: string;
}

export interface ChatTranscriptCitation extends ChatCitationBase {
  sourceType: 'transcript';
  segmentId: number;
  startedAtMs: number;
}

export interface ChatSummaryCitation extends ChatCitationBase {
  sourceType: 'summary';
  summaryId: number;
}

export type ChatCitation = ChatTranscriptCitation | ChatSummaryCitation;

export interface ChatRequestedEventData {
  type: 'CHAT_REQUESTED';
  meetingId: number;
  messageId: number;
  askerTeamMemberId: number;
  askerDisplayName: string;
  inputType: 'TEXT' | 'VOICE';
  question: string;
  createdAt: string;
  creditBalance: number;
}

export interface ChatCompletedEventData {
  type: 'CHAT_COMPLETED';
  meetingId: number;
  messageId: number;
  answer: string;
  citations: ChatCitation[];
  answeredAt: string;
}

export interface ChatFailedEventData {
  type: 'CHAT_FAILED';
  meetingId: number;
  messageId: number;
  creditBalance: number;
}

export type ChatSseEventData =
  ChatRequestedEventData | ChatCompletedEventData | ChatFailedEventData;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const isPositiveSafeInteger = (value: unknown): value is number =>
  typeof value === 'number' && Number.isSafeInteger(value) && value > 0;

const isNonNegativeSafeInteger = (value: unknown): value is number =>
  typeof value === 'number' && Number.isSafeInteger(value) && value >= 0;

const parseCitation = (value: unknown): ChatCitation | null => {
  if (
    !isRecord(value) ||
    !isPositiveSafeInteger(value.meetingId) ||
    typeof value.meetingTitle !== 'string' ||
    typeof value.meetingStartedAt !== 'string'
  ) {
    return null;
  }

  if (
    value.sourceType === 'transcript' &&
    isPositiveSafeInteger(value.segmentId) &&
    isNonNegativeSafeInteger(value.startedAtMs)
  ) {
    return {
      sourceType: value.sourceType,
      meetingId: value.meetingId,
      segmentId: value.segmentId,
      meetingTitle: value.meetingTitle,
      meetingStartedAt: value.meetingStartedAt,
      startedAtMs: value.startedAtMs,
    };
  }

  if (value.sourceType === 'summary' && isPositiveSafeInteger(value.summaryId)) {
    return {
      sourceType: value.sourceType,
      meetingId: value.meetingId,
      summaryId: value.summaryId,
      meetingTitle: value.meetingTitle,
      meetingStartedAt: value.meetingStartedAt,
    };
  }

  return null;
};

const parseCitations = (value: unknown): ChatCitation[] | null => {
  if (!Array.isArray(value)) return null;

  const citations: ChatCitation[] = [];
  for (const item of value) {
    const citation = parseCitation(item);
    if (!citation) return null;
    citations.push(citation);
  }

  return citations;
};

const parseChatRequestedEvent = (value: Record<string, unknown>): ChatRequestedEventData | null => {
  if (
    value.type !== 'CHAT_REQUESTED' ||
    !isPositiveSafeInteger(value.meetingId) ||
    !isPositiveSafeInteger(value.messageId) ||
    !isPositiveSafeInteger(value.askerTeamMemberId) ||
    typeof value.askerDisplayName !== 'string' ||
    (value.inputType !== 'TEXT' && value.inputType !== 'VOICE') ||
    typeof value.question !== 'string' ||
    typeof value.createdAt !== 'string' ||
    !isNonNegativeSafeInteger(value.creditBalance)
  ) {
    return null;
  }

  return {
    type: value.type,
    meetingId: value.meetingId,
    messageId: value.messageId,
    askerTeamMemberId: value.askerTeamMemberId,
    askerDisplayName: value.askerDisplayName,
    inputType: value.inputType,
    question: value.question,
    createdAt: value.createdAt,
    creditBalance: value.creditBalance,
  };
};

const parseChatCompletedEvent = (value: Record<string, unknown>): ChatCompletedEventData | null => {
  const citations = parseCitations(value.citations);
  if (
    value.type !== 'CHAT_COMPLETED' ||
    !isPositiveSafeInteger(value.meetingId) ||
    !isPositiveSafeInteger(value.messageId) ||
    typeof value.answer !== 'string' ||
    !citations ||
    typeof value.answeredAt !== 'string'
  ) {
    return null;
  }

  return {
    type: value.type,
    meetingId: value.meetingId,
    messageId: value.messageId,
    answer: value.answer,
    citations,
    answeredAt: value.answeredAt,
  };
};

const parseChatFailedEvent = (value: Record<string, unknown>): ChatFailedEventData | null => {
  if (
    value.type !== 'CHAT_FAILED' ||
    !isPositiveSafeInteger(value.meetingId) ||
    !isPositiveSafeInteger(value.messageId) ||
    !isNonNegativeSafeInteger(value.creditBalance)
  ) {
    return null;
  }

  return {
    type: value.type,
    meetingId: value.meetingId,
    messageId: value.messageId,
    creditBalance: value.creditBalance,
  };
};

export const parseChatSseEvent = (data: string): ChatSseEventData | null => {
  let value: unknown;

  try {
    value = JSON.parse(data);
  } catch {
    return null;
  }

  if (!isRecord(value)) return null;

  switch (value.type) {
    case 'CHAT_REQUESTED':
      return parseChatRequestedEvent(value);
    case 'CHAT_COMPLETED':
      return parseChatCompletedEvent(value);
    case 'CHAT_FAILED':
      return parseChatFailedEvent(value);
    default:
      return null;
  }
};
