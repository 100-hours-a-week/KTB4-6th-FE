'use client';

import { useState } from 'react';
import {
  CUSTOM_ATTENDEE_MAX_COUNT,
  MEETING_ATTENDEE_MAX_COUNT,
  type MeetingAttendeesRequest,
} from '@/features/meeting';
import { useTeamDetail, useTeamMembers } from '@/features/team-management';

export interface AttendeeMember {
  teamMemberId: number;
  name: string;
  isMe: boolean;
  isLeader: boolean;
}

export const useAttendeeSelection = (teamId: number) => {
  const teamQuery = useTeamDetail(teamId);
  const membersQuery = useTeamMembers(teamId);
  const team = teamQuery.data;
  const teamMembers = membersQuery.data;
  const [otherMemberIds, setOtherMemberIds] = useState<number[]>([]);
  const [customNames, setCustomNames] = useState<string[]>([]);

  const myTeamMemberId = team?.teamMemberId ?? null;
  const members: AttendeeMember[] = (teamMembers ?? [])
    .map((member) => ({
      teamMemberId: member.teamMemberId,
      name: member.displayName,
      isMe: member.teamMemberId === myTeamMemberId,
      isLeader: member.role === 'LEADER',
    }))
    .sort((a, b) => Number(b.isMe) - Number(a.isMe));

  const activeOtherMemberIds = teamMembers
    ? otherMemberIds.filter((id) => members.some((member) => member.teamMemberId === id))
    : otherMemberIds;
  const selectedTeamMemberIds =
    myTeamMemberId === null ? activeOtherMemberIds : [myTeamMemberId, ...activeOtherMemberIds];

  const status =
    team && teamMembers
      ? 'success'
      : teamQuery.isError || membersQuery.isError
        ? 'error'
        : 'loading';
  const isRetrying = teamQuery.isFetching || membersQuery.isFetching;

  const retry = () => {
    if (teamQuery.isError) void teamQuery.refetch();
    if (membersQuery.isError) void membersQuery.refetch();
  };
  const selectedCount = selectedTeamMemberIds.length + customNames.length;
  const isFull = selectedCount >= MEETING_ATTENDEE_MAX_COUNT;
  const canAddCustomName = !isFull && customNames.length < CUSTOM_ATTENDEE_MAX_COUNT;

  const toggleMember = (teamMemberId: number) => {
    if (teamMemberId === myTeamMemberId) return;

    setOtherMemberIds((current) => {
      if (current.includes(teamMemberId)) {
        return current.filter((id) => id !== teamMemberId);
      }
      return isFull ? current : [...current, teamMemberId];
    });
  };

  const addCustomName = (name: string) => {
    if (!canAddCustomName) return;
    setCustomNames((current) => [...current, name.trim()]);
  };

  const removeCustomName = (name: string) => {
    setCustomNames((current) => current.filter((customName) => customName !== name));
  };

  const attendeesRequest: MeetingAttendeesRequest = {
    attendeeTeamMemberIds: selectedTeamMemberIds,
    customAttendeeNames: customNames,
  };

  return {
    status,
    isRetrying,
    retry,
    members,
    selectedTeamMemberIds,
    selectedCount,
    maxCount: MEETING_ATTENDEE_MAX_COUNT,
    isFull,
    toggleMember,
    customNames,
    customMaxCount: CUSTOM_ATTENDEE_MAX_COUNT,
    canAddCustomName,
    addCustomName,
    removeCustomName,
    attendeesRequest,
  };
};
