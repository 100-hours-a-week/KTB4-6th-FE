'use client';

import type { ReactNode } from 'react';
import { AppToastProvider } from '@/shared/ui';

import { ThemeProvider } from './theme-provider';

interface AppProvidersProps {
  children: ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <AppToastProvider>{children}</AppToastProvider>
    </ThemeProvider>
  );
}
