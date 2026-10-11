import type { MeetingChatApiError } from '@/features/meeting-chat';

export type MeetingChatQuestionErrorRecovery = 'credits' | 'messages' | null;

interface MeetingChatQuestionErrorFeedback {
  message: string;
  recovery: MeetingChatQuestionErrorRecovery;
}

export const getMeetingChatQuestionErrorFeedback = (
  error: MeetingChatApiError,
): MeetingChatQuestionErrorFeedback => {
  switch (error.code) {
    case 'INSUFFICIENT_CREDIT':
    case 'CREDIT_INSUFFICIENT':
      return {
        message: '팀 크레딧이 부족해 질문할 수 없어요.',
        recovery: 'credits',
      };
    case 'AI_MESSAGE_ALREADY_PROCESSING':
      return {
        message: '이미 답변을 생성하고 있어요.\n잠시 후 다시 질문해주세요.',
        recovery: 'messages',
      };
    case 'INVALID_QUESTION_LENGTH':
      return {
        message: '질문은 1~1000자로 입력해주세요.',
        recovery: null,
      };
    case 'INVALID_INPUT_VALUE':
    case 'INVALID_INPUT_TYPE':
      return {
        message: '질문 내용을 확인해주세요.',
        recovery: null,
      };
    case 'MEETING_NOT_IN_PROGRESS':
      return {
        message: '진행 중인 회의에서만 질문할 수 있어요.',
        recovery: null,
      };
    case 'AUTH_REQUIRED':
    case 'INVALID_ACCESS_TOKEN':
    case 'ACCESS_TOKEN_EXPIRED':
    case 'UNAUTHORIZED':
    case 'TOKEN_EXPIRED':
      return {
        message: '인증 정보를 확인할 수 없어요.\n다시 로그인해주세요.',
        recovery: null,
      };
    case 'MEETING_ACCESS_DENIED':
    case 'NO_ACTIVE_TEAM':
    case 'TEAM_ACCESS_DENIED':
      return {
        message: 'AI 채팅에 접근할 권한이 없어요.',
        recovery: null,
      };
    case 'MEETING_NOT_FOUND':
      return {
        message: '회의 정보를 찾을 수 없어요.',
        recovery: null,
      };
    case 'AI_MESSAGE_REQUEST_FAILED':
    case 'INTERNAL_SERVER_ERROR':
    case 'UNKNOWN_ERROR':
    default:
      return {
        message: '질문을 보내지 못했어요.\n잠시 후 다시 시도해주세요.',
        recovery: null,
      };
  }
};
