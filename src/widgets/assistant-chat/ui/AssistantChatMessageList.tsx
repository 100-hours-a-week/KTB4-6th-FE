import type { AssistantChatMessage } from '../model/types';
import { AssistantChatMessageItem } from './AssistantChatMessageItem';

interface AssistantChatMessageListProps {
  messages: AssistantChatMessage[];
}

export const AssistantChatMessageList = ({ messages }: AssistantChatMessageListProps) => (
  <ol role="log" aria-label="미티와 나눈 대화" className="flex flex-col gap-4">
    {messages.map((message) => (
      <AssistantChatMessageItem key={message.id} message={message} />
    ))}
  </ol>
);
