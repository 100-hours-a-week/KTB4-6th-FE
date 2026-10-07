'use client';

import { useState, type ReactNode } from 'react';
import { MutationCache, QueryCache, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MeetingSseProvider } from '@/features/meeting-sse';
import { RecordingWebSocketProvider } from '@/features/recording-websocket';
import { AppToastProvider } from '@/shared/ui';

import { ClarityAnalytics } from './clarity-analytics';
import { ThemeProvider } from './theme-provider';
import { RecordingSessionManager } from './recording-session-manager';
import { reportQueryError } from './report-query-error';
// 모듈이 로드되는 즉시 apiClient에 401 재발급 인터셉터를 등록한다 (부작용을 위한 import).
import './use-auth-retry-interceptor';

interface AppProvidersProps {
  children: ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        queryCache: new QueryCache({
          onError: (error, query) =>
            reportQueryError(error, { type: 'query', key: query.queryKey }),
        }),
        mutationCache: new MutationCache({
          onError: (error, _variables, _onMutateResult, mutation) =>
            reportQueryError(error, { type: 'mutation', key: mutation.options.mutationKey }),
        }),
        defaultOptions: {
          queries: { refetchOnWindowFocus: false, retry: false },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ClarityAnalytics />
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
        <MeetingSseProvider>
          <AppToastProvider>
            <RecordingWebSocketProvider>
              <RecordingSessionManager />
              {children}
            </RecordingWebSocketProvider>
          </AppToastProvider>
        </MeetingSseProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
