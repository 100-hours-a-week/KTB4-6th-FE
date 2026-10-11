'use client';

import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { meetingChatKeys } from '@/features/meeting-chat';
import { useMeetingSse } from '@/features/meeting-sse';
import { teamKeys, type TeamCreditsData } from '@/features/team-management';
import {
  hasMeetingChatMessage,
  mergeMeetingChatEvent,
  type MeetingChatInfiniteData,
} from './meeting-chat-event-cache';

interface UseMeetingChatEventSyncOptions {
  meetingId: number;
  teamId: number;
  currentTeamMemberId: number | null;
  isEnabled: boolean;
}

export const useMeetingChatEventSync = ({
  meetingId,
  teamId,
  currentTeamMemberId,
  isEnabled,
}: UseMeetingChatEventSyncOptions) => {
  const queryClient = useQueryClient();
  const { statuses, subscribeChatEvent } = useMeetingSse();
  const hasDisconnected = useRef(false);
  const meetingSseStatus = statuses[String(meetingId)];

  useEffect(() => {
    if (!isEnabled) {
      hasDisconnected.current = false;
      return;
    }

    if (meetingSseStatus === 'error') {
      hasDisconnected.current = true;
      return;
    }

    if (meetingSseStatus !== 'connected' || !hasDisconnected.current) return;
    hasDisconnected.current = false;

    void queryClient.invalidateQueries({ queryKey: meetingChatKeys.list(meetingId) });
    void queryClient.invalidateQueries({ queryKey: teamKeys.credits(teamId) });
  }, [isEnabled, meetingId, meetingSseStatus, queryClient, teamId]);

  useEffect(() => {
    if (!isEnabled) return;

    return subscribeChatEvent(String(meetingId), (event) => {
      const chatQueryKey = meetingChatKeys.list(meetingId);
      const cancelChatQuery = queryClient.cancelQueries(
        { queryKey: chatQueryKey, exact: true },
        { revert: false },
      );
      const currentChats = queryClient.getQueryData<MeetingChatInfiniteData>(chatQueryKey);
      const hasMessage = currentChats
        ? hasMeetingChatMessage(currentChats, event.messageId)
        : false;

      queryClient.setQueryData<MeetingChatInfiniteData>(chatQueryKey, (current) =>
        current ? mergeMeetingChatEvent(current, event, currentTeamMemberId) : current,
      );

      if (!currentChats || (event.type !== 'CHAT_REQUESTED' && !hasMessage)) {
        void cancelChatQuery.then(() =>
          queryClient.invalidateQueries({ queryKey: chatQueryKey, exact: true }),
        );
      }

      if (event.type === 'CHAT_REQUESTED' || event.type === 'CHAT_FAILED') {
        const creditsQueryKey = teamKeys.credits(teamId);
        const cancelCreditsQuery = queryClient.cancelQueries(
          { queryKey: creditsQueryKey, exact: true },
          { revert: false },
        );
        const currentCredits = queryClient.getQueryData<TeamCreditsData>(creditsQueryKey);

        queryClient.setQueryData<TeamCreditsData>(creditsQueryKey, (current) =>
          current ? { ...current, balance: event.creditBalance } : current,
        );

        if (!currentCredits) {
          void cancelCreditsQuery.then(() =>
            queryClient.invalidateQueries({ queryKey: creditsQueryKey, exact: true }),
          );
        }
      }
    });
  }, [currentTeamMemberId, isEnabled, meetingId, queryClient, subscribeChatEvent, teamId]);
};
