'use client';

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { meetingChatKeys } from '@/features/meeting-chat';
import { useMeetingSse } from '@/features/meeting-sse';
import { teamKeys, type TeamCreditsData } from '@/features/team-management';
import { mergeMeetingChatEvent, type MeetingChatInfiniteData } from './meeting-chat-event-cache';

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
  const { subscribeChatEvent } = useMeetingSse();

  useEffect(() => {
    if (!isEnabled) return;

    return subscribeChatEvent(String(meetingId), (event) => {
      queryClient.setQueryData<MeetingChatInfiniteData>(
        meetingChatKeys.list(meetingId),
        (current) =>
          current ? mergeMeetingChatEvent(current, event, currentTeamMemberId) : current,
      );

      if (event.type === 'CHAT_REQUESTED' || event.type === 'CHAT_FAILED') {
        queryClient.setQueryData<TeamCreditsData>(teamKeys.credits(teamId), (current) =>
          current ? { ...current, balance: event.creditBalance } : current,
        );
      }
    });
  }, [currentTeamMemberId, isEnabled, meetingId, queryClient, subscribeChatEvent, teamId]);
};
