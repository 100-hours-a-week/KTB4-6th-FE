'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLeaveTeam } from '@/features/team-management';
import { useAppToast } from '@/shared/ui';
import { teamManagementToastMessages } from '../model/toast-messages';
import { TeamLeaveDialog } from './TeamLeaveDialog';

interface TeamLeaveActionProps {
  hasActiveMeeting: boolean;
  teamId: number;
}

export const TeamLeaveAction = ({ hasActiveMeeting, teamId }: TeamLeaveActionProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const router = useRouter();
  const { showToast } = useAppToast();
  const leaveTeamMutation = useLeaveTeam(teamId);

  const handleLeaveConfirm = () => {
    leaveTeamMutation.mutate(undefined, {
      onSuccess: () => {
        router.replace('/');
        const { text, variant } = teamManagementToastMessages.teamLeaveSuccess;
        showToast(text, variant);
      },
      onError: () => {
        const { text, variant } = teamManagementToastMessages.teamLeaveFailure;
        showToast(text, variant);
      },
    });
  };

  return (
    <div className="px-5 pb-8 text-center">
      <button
        type="button"
        onClick={() => setIsDialogOpen(true)}
        className="text-sm font-medium text-cool-500 underline underline-offset-2"
      >
        나가기
      </button>

      <TeamLeaveDialog
        hasActiveMeeting={hasActiveMeeting}
        isOpen={isDialogOpen}
        onConfirm={handleLeaveConfirm}
        onOpenChange={setIsDialogOpen}
      />
    </div>
  );
};
