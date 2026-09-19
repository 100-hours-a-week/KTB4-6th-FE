'use client';

import { useState } from 'react';
import { delegateTeamLeader, kickTeamMember } from '@/features/team-management';
import { useAppToast } from '@/shared/ui';
import { getMemberKickSuccessToast, teamManagementToastMessages } from '../model/toast-messages';
import type { Participant, TeamMemberRole } from '../model/types';
import { LeaderDelegateDialog } from './LeaderDelegateDialog';
import { MemberKickDialog } from './MemberKickDialog';
import { ParticipantListItem } from './ParticipantListItem';

interface ParticipantListSectionProps {
  role: TeamMemberRole;
  participants: Participant[];
  teamId: number;
  onLeaderDelegated: () => void;
  onMemberKicked: (teamMemberId: number) => void;
}

export const ParticipantListSection = ({
  role,
  participants,
  teamId,
  onLeaderDelegated,
  onMemberKicked,
}: ParticipantListSectionProps) => {
  const [delegateTarget, setDelegateTarget] = useState<Participant | null>(null);
  const [kickTarget, setKickTarget] = useState<Participant | null>(null);
  const { showToast } = useAppToast();

  const handleDelegateConfirm = async () => {
    if (!delegateTarget) return;

    try {
      await delegateTeamLeader(teamId, Number(delegateTarget.id));
      onLeaderDelegated();
      const { text, variant } = teamManagementToastMessages.leaderDelegateSuccess;
      showToast(text, variant);
    } catch {
      const { text, variant } = teamManagementToastMessages.leaderDelegateFailure;
      showToast(text, variant);
    }
  };

  const handleKickConfirm = async () => {
    if (!kickTarget) return;

    try {
      await kickTeamMember(teamId, Number(kickTarget.id));
      onMemberKicked(Number(kickTarget.id));
      const { text, variant } = getMemberKickSuccessToast(kickTarget.name);
      showToast(text, variant);
    } catch {
      const { text, variant } = teamManagementToastMessages.memberKickFailure;
      showToast(text, variant);
    }
  };

  return (
    <section className="mt-6 px-5">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-cool-900">참여자 목록</h2>
        <span className="text-sm text-cool-500">{participants.length}명</span>
      </div>

      <ul className="mt-2">
        {participants.map((participant, index) => (
          <ParticipantListItem
            key={participant.id}
            order={index + 1}
            participant={participant}
            showManageAction={role === 'leader' && !participant.isMe}
            onDelegateClick={setDelegateTarget}
            onKickClick={setKickTarget}
          />
        ))}
      </ul>

      <LeaderDelegateDialog
        isOpen={delegateTarget !== null}
        onConfirm={() => void handleDelegateConfirm()}
        onOpenChange={(open) => {
          if (!open) setDelegateTarget(null);
        }}
        participantName={delegateTarget?.name ?? ''}
      />

      <MemberKickDialog
        isOpen={kickTarget !== null}
        onConfirm={() => void handleKickConfirm()}
        onOpenChange={(open) => {
          if (!open) setKickTarget(null);
        }}
        participantName={kickTarget?.name ?? ''}
      />
    </section>
  );
};
