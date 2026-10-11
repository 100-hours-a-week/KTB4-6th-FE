'use client';

import type { ChatMessageViewModel } from '../model/meeting-chat-messages';
import { useMeetingChatReverseScroll } from '../model/useMeetingChatReverseScroll';
import { ChatMessageItem } from './ChatMessageItem';
import {
  ChatHistoryErrorState,
  ChatHistoryLoadingState,
  ChatListEmptyState,
  ChatListErrorState,
  ChatListLoadingState,
} from './ChatMessageListStates';

interface ChatMessageListProps {
  messages: ChatMessageViewModel[];
  isLoading: boolean;
  isError: boolean;
  isRetrying: boolean;
  hasOlderMessages: boolean;
  isLoadingOlderMessages: boolean;
  hasLoadingOlderMessagesError: boolean;
  onRetry: () => void;
  onLoadOlderMessages: () => Promise<unknown>;
}

export const ChatMessageList = ({
  messages,
  isLoading,
  isError,
  isRetrying,
  hasOlderMessages,
  isLoadingOlderMessages,
  hasLoadingOlderMessagesError,
  onRetry,
  onLoadOlderMessages,
}: ChatMessageListProps) => {
  const { scrollContainerRef, topSentinelRef, retryLoadOlderMessages } =
    useMeetingChatReverseScroll({
      messageCount: messages.length,
      isInitialLoading: isLoading,
      hasOlderMessages,
      isLoadingOlderMessages,
      hasLoadingOlderMessagesError,
      onLoadOlderMessages,
    });

  return (
    <main
      ref={scrollContainerRef}
      data-clarity-mask="true"
      className="flex min-h-0 flex-1 flex-col overflow-y-auto px-5 py-4"
    >
      <div ref={topSentinelRef} aria-hidden="true" className="h-px shrink-0" />
      {isLoadingOlderMessages ? (
        <ChatHistoryLoadingState />
      ) : hasLoadingOlderMessagesError ? (
        <ChatHistoryErrorState onRetry={retryLoadOlderMessages} />
      ) : null}
      <p className="mb-5 text-center text-xs text-cool-500">
        질문과 답변은 회의 참여자 모두에게 보여요
      </p>
      {isError ? (
        <ChatListErrorState isRetrying={isRetrying} onRetry={onRetry} />
      ) : isLoading ? (
        <ChatListLoadingState />
      ) : messages.length === 0 ? (
        <ChatListEmptyState />
      ) : (
        <ol className="flex flex-col gap-7">
          {messages.map((message) => (
            <ChatMessageItem key={message.id} message={message} />
          ))}
        </ol>
      )}
    </main>
  );
};
