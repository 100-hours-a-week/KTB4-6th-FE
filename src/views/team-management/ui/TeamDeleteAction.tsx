'use client';

import { useState } from 'react';
import { useAppToast } from '@/shared/ui';
import { teamManagementToastMessages } from '../model/toast-messages';
import { TeamDeleteDialog } from './TeamDeleteDialog';

interface TeamDeleteActionProps {
  hasActiveMeeting: boolean;
}

export const TeamDeleteAction = ({ hasActiveMeeting }: TeamDeleteActionProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { showToast } = useAppToast();

  const handleClick = () => {
    if (hasActiveMeeting) {
      const { text, variant } = teamManagementToastMessages.teamDeleteBlockedByActiveMeeting;
      showToast(text, variant);
      return;
    }

    setIsDialogOpen(true);
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

      <TeamDeleteDialog isOpen={isDialogOpen} onOpenChange={setIsDialogOpen} />
    </div>
  );
};
