export type AssistantChatMessageRole = 'user' | 'assistant';

export type AssistantChatMessageStatus = 'streaming' | 'completed' | 'failed';

export interface AssistantChatMessage {
  id: string;
  role: AssistantChatMessageRole;
  text: string;
  status: AssistantChatMessageStatus;
}
