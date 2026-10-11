import {
  getMeetingChatAnswerState,
  type MeetingChatAnswerState,
  type MeetingChatCitation,
  type MeetingChatListData,
  type MeetingChatMessageData,
} from '@/features/meeting-chat';

const chatTimeFormatter = new Intl.DateTimeFormat('ko-KR', {
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
});

export interface ChatMessageViewModel {
  id: string;
  messageId: number | null;
  askerTeamMemberId: number | null;
  askerDisplayName: string;
  createdAtLabel: string;
  question: string;
  answerState: MeetingChatAnswerState;
  answer: string | null;
  citations: MeetingChatCitation[] | null;
}

export const formatChatMessageTime = (createdAt: string | Date) =>
  chatTimeFormatter.format(new Date(createdAt));

const toChatMessageViewModel = (
  message: MeetingChatMessageData,
  now: number,
): ChatMessageViewModel => ({
  id: `chat-message-${message.messageId}`,
  messageId: message.messageId,
  askerTeamMemberId: message.askerTeamMemberId,
  askerDisplayName: message.askerDisplayName,
  createdAtLabel: formatChatMessageTime(message.createdAt),
  question: message.question,
  answerState: getMeetingChatAnswerState(message, now),
  answer: message.answer,
  citations: message.citations,
});

export const collectMeetingChatMessages = (pages: MeetingChatListData[]) => {
  const messagesById = new Map<number, MeetingChatMessageData>();

  pages
    .slice()
    .reverse()
    .forEach((page) => {
      page.messages.forEach((message) => {
        messagesById.set(message.messageId, message);
      });
    });

  return Array.from(messagesById.values()).sort((left, right) => left.messageId - right.messageId);
};

export const toChatMessageViewModels = (messages: MeetingChatMessageData[], now: number) =>
  messages.map((message) => toChatMessageViewModel(message, now));
