'use client';

import type { ReactNode } from 'react';
import { Toast } from '@base-ui/react/toast';
import { cn, useAppFrameElement } from '@/shared/lib';

export type AppToastVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

const TOAST_DURATION_MS = 1000;

const TOAST_DOT_CLASS_NAMES = {
  success: 'bg-success',
  warning: 'bg-warning',
  danger: 'bg-danger',
  info: 'bg-brand-300',
} as const;

interface AppToastData {
  variant?: AppToastVariant;
}

interface AppToastProviderProps {
  children: ReactNode;
}

// 설계서 지시사항: 토스트 배경은 하나로 통일하고, 성공/실패는 좌측 점(dot) 색상으로만 구분한다.
export const AppToastProvider = ({ children }: AppToastProviderProps) => {
  // 390px 모바일 프레임 안에만 토스트가 보이도록 포털 대상을 지정한다.
  const frame = useAppFrameElement();

  return (
    <Toast.Provider timeout={TOAST_DURATION_MS}>
      {children}
      <Toast.Portal container={frame}>
        <Toast.Viewport className="pointer-events-none fixed inset-x-0 bottom-6 z-[100] mx-auto flex w-full max-w-[390px] flex-col items-center gap-2 px-4">
          <AppToastList />
        </Toast.Viewport>
      </Toast.Portal>
    </Toast.Provider>
  );
};

const AppToastList = () => {
  const { toasts } = Toast.useToastManager();

  return toasts.map((toast) => {
    const variant = (toast.data as AppToastData | undefined)?.variant ?? 'neutral';

    return (
      <Toast.Root
        key={toast.id}
        toast={toast}
        className={cn(
          'pointer-events-auto w-fit max-w-[85%] rounded-full bg-cool-900 px-4 py-2.5 shadow-[0_8px_24px_rgba(20,34,56,0.24)]',
          'data-ending-style:opacity-0 data-starting-style:translate-y-2 data-starting-style:opacity-0',
          'transition-all duration-200',
        )}
      >
        <Toast.Content className="flex items-center justify-center gap-2">
          {variant !== 'neutral' ? (
            <span
              className={cn('size-1.5 shrink-0 rounded-full', TOAST_DOT_CLASS_NAMES[variant])}
            />
          ) : null}
          <Toast.Description className="text-sm leading-5 font-medium whitespace-pre-line text-white" />
        </Toast.Content>
      </Toast.Root>
    );
  });
};

export const useAppToast = () => {
  const manager = Toast.useToastManager();

  const showToast = (description: string, variant: AppToastVariant = 'neutral') =>
    manager.add({ description, data: { variant } satisfies AppToastData });

  return { showToast };
};
