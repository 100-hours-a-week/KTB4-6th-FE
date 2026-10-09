import type { AppToastVariant } from '@/shared/ui';

interface ToastMessage {
  text: string;
  variant: AppToastVariant;
}

export const notificationToastMessages = {
  deleteFailure: { text: '알림을 삭제하지 못했어요. 다시 시도해주세요.', variant: 'danger' },
  readAllFailure: { text: '알림을 읽음 처리하지 못했어요. 다시 시도해주세요.', variant: 'danger' },
} satisfies Record<string, ToastMessage>;
