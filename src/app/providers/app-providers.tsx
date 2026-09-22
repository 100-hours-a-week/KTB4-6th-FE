'use client';

import { useState, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MeetingSseProvider } from '@/features/meeting-sse';
import { RecordingWebSocketProvider } from '@/features/recording-websocket';
import { AppToastProvider } from '@/shared/ui';

import { ThemeProvider } from './theme-provider';
import { useAuthRetryInterceptor } from './use-auth-retry-interceptor';

interface AppProvidersProps {
  children: ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  useAuthRetryInterceptor();
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { refetchOnWindowFocus: false, retry: false },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
        <MeetingSseProvider>
          <AppToastProvider>
            <RecordingWebSocketProvider>{children}</RecordingWebSocketProvider>
          </AppToastProvider>
        </MeetingSseProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
