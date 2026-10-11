export const meetingChatKeys = {
  all: ['meeting-chat'] as const,
  list: (meetingId: number) => [...meetingChatKeys.all, 'list', meetingId] as const,
};
