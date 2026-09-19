'use client';

import { useState } from 'react';
import { useDelegateTeamLeader, useKickTeamMember } from '@/features/team-management';
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
}

export const ParticipantListSection = ({
  role,
  participants,
  teamId,
}: ParticipantListSectionProps) => {
  const [delegateTarget, setDelegateTarget] = useState<Participant | null>(null);
  const [kickTarget, setKickTarget] = useState<Participant | null>(null);
  const { showToast } = useAppToast();
  const delegateTeamLeaderMutation = useDelegateTeamLeader(teamId);
  const kickTeamMemberMutation = useKickTeamMember(teamId);

  const handleDelegateConfirm = () => {
    if (!delegateTarget) return;

    delegateTeamLeaderMutation.mutate(Number(delegateTarget.id), {
      onSuccess: () => {
        const { text, variant } = teamManagementToastMessages.leaderDelegateSuccess;
        showToast(text, variant);
      },
      onError: () => {
        const { text, variant } = teamManagementToastMessages.leaderDelegateFailure;
        showToast(text, variant);
      },
    });
  };

  const handleKickConfirm = () => {
    if (!kickTarget) return;

    const target = kickTarget;

    kickTeamMemberMutation.mutate(Number(target.id), {
      onSuccess: () => {
        const { text, variant } = getMemberKickSuccessToast(target.name);
        showToast(text, variant);
      },
      onError: () => {
        const { text, variant } = teamManagementToastMessages.memberKickFailure;
        showToast(text, variant);
      },
    });
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
        onConfirm={handleDelegateConfirm}
        onOpenChange={(open) => {
          if (!open) setDelegateTarget(null);
        }}
        participantName={delegateTarget?.name ?? ''}
      />

      <MemberKickDialog
        isOpen={kickTarget !== null}
        onConfirm={handleKickConfirm}
        onOpenChange={(open) => {
          if (!open) setKickTarget(null);
        }}
        participantName={kickTarget?.name ?? ''}
      />
    </section>
  );
};
