'use client';

import type { ReactNode } from 'react';
import { Toast } from '@base-ui/react/toast';
import { cn, useAppFrameElement } from '@/shared/lib';

export type AppToastVariant = 'success' | 'danger' | 'neutral';

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
    <Toast.Provider>
      {children}
      <Toast.Portal container={frame}>
        <Toast.Viewport className="pointer-events-none absolute inset-x-4 top-4 z-[70] flex flex-col items-stretch gap-2">
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
          'pointer-events-auto rounded-xl border border-cool-100 bg-white px-4 py-3 shadow-[0_8px_24px_rgba(20,34,56,0.12)]',
          'data-ending-style:opacity-0 data-starting-style:-translate-y-2 data-starting-style:opacity-0',
          'transition-all duration-200',
        )}
      >
        <Toast.Content className="flex items-start gap-2.5">
          {variant !== 'neutral' ? (
            <span
              className={cn(
                'mt-1.5 size-1.5 shrink-0 rounded-full',
                variant === 'success' ? 'bg-success' : 'bg-danger',
              )}
            />
          ) : null}
          <Toast.Description className="text-sm leading-5 font-medium whitespace-pre-line text-cool-900" />
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
