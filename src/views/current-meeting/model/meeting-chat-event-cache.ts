import type { InfiniteData } from '@tanstack/react-query';
import type { MeetingChatListData, MeetingChatMessageData } from '@/features/meeting-chat';
import type { ChatRequestedEventData, ChatSseEventData } from '@/features/meeting-sse';

export type MeetingChatInfiniteData = InfiniteData<MeetingChatListData>;

const createProcessingMessage = (event: ChatRequestedEventData): MeetingChatMessageData => ({
  messageId: event.messageId,
  askerTeamMemberId: event.askerTeamMemberId,
  askerDisplayName: event.askerDisplayName,
  inputType: event.inputType,
  question: event.question,
  answer: null,
  status: 'PROCESSING',
  citations: null,
  createdAt: event.createdAt,
  answeredAt: null,
});

export const mergeMeetingChatEvent = (
  current: MeetingChatInfiniteData,
  event: ChatSseEventData,
  currentTeamMemberId: number | null,
): MeetingChatInfiniteData => {
  const hasMessage = current.pages.some((page) =>
    page.messages.some((message) => message.messageId === event.messageId),
  );

  if (event.type === 'CHAT_REQUESTED') {
    const hasCurrentUserAsked = event.askerTeamMemberId === currentTeamMemberId;
    if (hasMessage) {
      if (!hasCurrentUserAsked) return current;

      return {
        ...current,
        pages: current.pages.map((page) => ({
          ...page,
          hasAskedQuestion: true,
        })),
      };
    }

    const [latestPage, ...olderPages] = current.pages;
    if (!latestPage) return current;

    return {
      ...current,
      pages: [
        {
          ...latestPage,
          messages: [...latestPage.messages, createProcessingMessage(event)].sort(
            (left, right) => left.messageId - right.messageId,
          ),
          hasAskedQuestion: latestPage.hasAskedQuestion || hasCurrentUserAsked,
        },
        ...olderPages.map((page) => ({
          ...page,
          hasAskedQuestion: page.hasAskedQuestion || hasCurrentUserAsked,
        })),
      ],
    };
  }

  if (!hasMessage) return current;

  return {
    ...current,
    pages: current.pages.map((page) => ({
      ...page,
      messages: page.messages.map((message) => {
        if (message.messageId !== event.messageId) return message;

        if (event.type === 'CHAT_COMPLETED') {
          return {
            ...message,
            answer: event.answer,
            status: 'COMPLETED',
            citations: event.citations,
            answeredAt: event.answeredAt,
          };
        }

        return {
          ...message,
          answer: null,
          status: 'FAILED',
          citations: null,
          answeredAt: null,
        };
      }),
    })),
  };
};
