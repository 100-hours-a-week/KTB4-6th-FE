import type { AppToastVariant } from '@/shared/ui';

export type RecordingBlockedReason = 'connecting' | 'disconnected' | 'other-recording';

interface BlockedToast {
  message: string;
  variant: AppToastVariant;
}

export const RECORDING_BLOCKED_TOASTS: Record<RecordingBlockedReason, BlockedToast> = {
  connecting: {
    message: '실시간 연결 중입니다. 잠시 후 다시 시도해주세요.',
    variant: 'neutral',
  },
  disconnected: { message: '서버에 연결할 수 없습니다.', variant: 'danger' },
  'other-recording': { message: '녹음이 진행중입니다.', variant: 'info' },
};

export const MEETING_DELETE_BLOCKED_TOAST: BlockedToast = {
  message: '회의 진행 중에는 삭제할 수 없습니다. 회의를 종료한 뒤 삭제해주세요.',
  variant: 'danger',
};

export const MEETING_LEAVE_BLOCKED_TOAST: BlockedToast = {
  message: '회의 진행 중에는 나갈 수 없습니다.',
  variant: 'danger',
};
