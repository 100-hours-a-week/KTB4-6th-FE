'use client';

import type { ReactNode } from 'react';
import { AppToastProvider } from '@/shared/ui';

import { ThemeProvider } from './theme-provider';
import { useAuthRetryInterceptor } from './use-auth-retry-interceptor';

interface AppProvidersProps {
  children: ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  useAuthRetryInterceptor();

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <AppToastProvider>{children}</AppToastProvider>
    </ThemeProvider>
  );
}
