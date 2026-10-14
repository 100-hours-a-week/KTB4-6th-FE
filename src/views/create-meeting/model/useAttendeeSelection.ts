'use client';

import { useState } from 'react';
import { CUSTOM_ATTENDEE_MAX_COUNT, MEETING_ATTENDEE_MAX_COUNT } from '@/features/meeting';
import { useTeamDetail, useTeamMembers } from '@/features/team-management';

export interface AttendeeMember {
  teamMemberId: number;
  name: string;
  isMe: boolean;
  isLeader: boolean;
}

export const useAttendeeSelection = (teamId: number) => {
  const { data: team } = useTeamDetail(teamId);
  const { data: teamMembers } = useTeamMembers(teamId);
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

  const selectedTeamMemberIds =
    myTeamMemberId === null ? otherMemberIds : [myTeamMemberId, ...otherMemberIds];
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

  return {
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
  };
};
