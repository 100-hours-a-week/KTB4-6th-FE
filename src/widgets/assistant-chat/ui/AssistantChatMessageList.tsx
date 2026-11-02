import type { AssistantChatMessage } from '../model/types';
import { AssistantChatMessageItem } from './AssistantChatMessageItem';

interface AssistantChatMessageListProps {
  messages: AssistantChatMessage[];
  teamId: number;
  memberNames: ReadonlyMap<number, string>;
  onResendQuestion: (messageId: string) => void;
  onConfirmMeetingDraft: (messageId: string) => void;
  onCancelMeetingDraft: (messageId: string) => void;
  onMeetingLinkClick: () => void;
}

export const AssistantChatMessageList = ({
  messages,
  ...itemProps
}: AssistantChatMessageListProps) => (
  <ol role="log" aria-label="미티와 나눈 대화" className="flex flex-col gap-4">
    {messages.map((message, index) => (
      <AssistantChatMessageItem
        key={message.id}
        message={message}
        canResend={index === messages.length - 1}
        {...itemProps}
      />
    ))}
  </ol>
);
