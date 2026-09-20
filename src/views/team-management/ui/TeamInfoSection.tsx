'use client';

import { Copy, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import {
  TeamManagementApiError,
  useRegenerateInvitationCode,
  useUpdateTeamName,
} from '@/features/team-management';
import { useCopyInviteCode } from '@/entities/invite-code';
import { useAppToast } from '@/shared/ui';
import { teamManagementToastMessages } from '../model/toast-messages';
import type { TeamInfo, TeamMemberRole } from '../model/types';
import { InviteCodeRegenerateDialog } from './InviteCodeRegenerateDialog';
import { TeamNameField } from './TeamNameField';

interface TeamInfoSectionProps {
  role: TeamMemberRole;
  team: TeamInfo;
  teamId: number;
}

export const TeamInfoSection = ({ role, team, teamId }: TeamInfoSectionProps) => {
  const isLeader = role === 'leader';
  const [isRegenerateDialogOpen, setIsRegenerateDialogOpen] = useState(false);
  const { showToast } = useAppToast();
  const { copyInviteCode } = useCopyInviteCode();
  const updateTeamNameMutation = useUpdateTeamName(teamId);
  const regenerateInvitationCodeMutation = useRegenerateInvitationCode(teamId);

  const handleSaveTeamName = (name: string) => {
    updateTeamNameMutation.mutate(name, {
      onSuccess: () => {
        const { text, variant } = teamManagementToastMessages.teamNameUpdateSuccess;
        showToast(text, variant);
      },
      onError: () => {
        const { text, variant } = teamManagementToastMessages.teamNameUpdateFailure;
        showToast(text, variant);
      },
    });
  };

  const handleRegenerateInviteCode = () => {
    regenerateInvitationCodeMutation.mutate(undefined, {
      onSuccess: () => {
        const { text, variant } = teamManagementToastMessages.inviteCodeRegenerateSuccess;
        showToast(text, variant);
      },
      onError: (error) => {
        const isLimitExceeded =
          error instanceof TeamManagementApiError &&
          error.code === 'INVITATION_CODE_REGENERATION_LIMIT_EXCEEDED';
        const { text, variant } = isLimitExceeded
          ? teamManagementToastMessages.inviteCodeRegenerateLimitExceeded
          : teamManagementToastMessages.inviteCodeRegenerateFailure;
        showToast(text, variant);
      },
    });
  };

  return (
    <section className="px-5 pt-5">
      <TeamNameField isEditable={isLeader} name={team.name} onSave={handleSaveTeamName} />

      <div className="mt-4 grid grid-cols-[1.6fr_1fr] gap-3">
        <div className="rounded-xl border border-cool-100 bg-white px-4 py-3">
          <div className="flex items-center justify-between">
            <p className="text-xs text-cool-500">초대코드</p>
            <div className="flex items-center gap-1">
              {isLeader && (
                <button
                  type="button"
                  aria-label="초대 코드 재생성"
                  onClick={() => setIsRegenerateDialogOpen(true)}
                  className="flex size-7 items-center justify-center rounded-full text-cool-500 transition-colors hover:bg-cool-100 hover:text-cool-900"
                >
                  <RefreshCw className="size-3.5" strokeWidth={2} />
                </button>
              )}
              <button
                type="button"
                aria-label="초대 코드 복사"
                onClick={() => void copyInviteCode(team.inviteCode)}
                className="flex size-7 items-center justify-center rounded-full text-cool-500 transition-colors hover:bg-cool-100 hover:text-cool-900"
              >
                <Copy className="size-3.5" strokeWidth={2} />
              </button>
            </div>
          </div>
          <p className="mt-1 text-lg font-bold tracking-wide text-cool-900">{team.inviteCode}</p>
        </div>

        <div className="rounded-xl border border-cool-100 bg-white px-4 py-3">
          <p className="text-xs text-cool-500">남은 크레딧</p>
          <p className="mt-1 text-lg font-bold text-cool-900">{team.creditBalance} 크레딧</p>
        </div>
      </div>

      <InviteCodeRegenerateDialog
        isOpen={isRegenerateDialogOpen}
        onConfirm={handleRegenerateInviteCode}
        onOpenChange={setIsRegenerateDialogOpen}
      />
    </section>
  );
};
