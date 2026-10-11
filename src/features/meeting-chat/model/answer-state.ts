import { parseServerDate } from '@/shared/lib';
import type { MeetingChatMessageData } from './types';

const MEETING_CHAT_ANSWER_TIMEOUT_MS = 65_000;

export type MeetingChatAnswerState = 'pending' | 'completed' | 'failed';

type MeetingChatAnswerSource = Pick<MeetingChatMessageData, 'status' | 'createdAt'>;

export const getMeetingChatAnswerDeadline = ({ status, createdAt }: MeetingChatAnswerSource) =>
  status === 'ACCEPTED' || status === 'PROCESSING'
    ? parseServerDate(createdAt).getTime() + MEETING_CHAT_ANSWER_TIMEOUT_MS
    : null;

export const getMeetingChatAnswerState = (
  message: MeetingChatAnswerSource,
  now: number,
): MeetingChatAnswerState => {
  if (message.status === 'COMPLETED') return 'completed';
  if (message.status === 'FAILED') return 'failed';

  const deadline = getMeetingChatAnswerDeadline(message);
  return deadline !== null && now < deadline ? 'pending' : 'failed';
};
