'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDeleteTeam } from '@/features/team-management';
import { useAppToast } from '@/shared/ui';
import { teamManagementToastMessages } from '../model/toast-messages';
import { TeamDeleteDialog } from './TeamDeleteDialog';

interface TeamDeleteActionProps {
  hasActiveMeeting: boolean;
  teamId: number;
}

export const TeamDeleteAction = ({ hasActiveMeeting, teamId }: TeamDeleteActionProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const router = useRouter();
  const { showToast } = useAppToast();
  const deleteTeamMutation = useDeleteTeam(teamId);

  const handleClick = () => {
    if (hasActiveMeeting) {
      const { text, variant } = teamManagementToastMessages.teamDeleteBlockedByActiveMeeting;
      showToast(text, variant);
      return;
    }

    setIsDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    deleteTeamMutation.mutate(undefined, {
      onSuccess: () => {
        router.replace('/');
        const { text, variant } = teamManagementToastMessages.teamDeleteSuccess;
        showToast(text, variant);
      },
      onError: () => {
        const { text, variant } = teamManagementToastMessages.teamDeleteFailure;
        showToast(text, variant);
      },
    });
  };

  return (
    <div className="px-5 pb-8 text-center">
      <button
        type="button"
        onClick={handleClick}
        className="text-sm font-medium text-danger underline underline-offset-2"
      >
        팀 삭제하기
      </button>

      <TeamDeleteDialog
        isOpen={isDialogOpen}
        onConfirm={handleDeleteConfirm}
        onOpenChange={setIsDialogOpen}
      />
    </div>
  );
};
