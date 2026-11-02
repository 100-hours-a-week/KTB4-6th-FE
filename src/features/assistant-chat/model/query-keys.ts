export const assistantChatKeys = {
  all: ['assistant-chat'] as const,
  turns: (teamId: number) => [...assistantChatKeys.all, 'turns', teamId] as const,
  turn: (requestId: number) => [...assistantChatKeys.all, 'turn', requestId] as const,
};
