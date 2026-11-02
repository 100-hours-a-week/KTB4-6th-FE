'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { getAssistantChatTurns } from '../api/get-assistant-chat-turns';
import { assistantChatKeys } from './query-keys';

export const useAssistantChatTurns = (teamId: number) =>
  useInfiniteQuery({
    queryKey: assistantChatKeys.turns(teamId),
    queryFn: ({ pageParam, signal }) => getAssistantChatTurns(teamId, pageParam, signal),
    initialPageParam: undefined as number | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.hasNext && lastPage.nextCursor !== null ? lastPage.nextCursor : undefined,
    enabled: Number.isSafeInteger(teamId) && teamId > 0,
    refetchOnMount: 'always',
  });
