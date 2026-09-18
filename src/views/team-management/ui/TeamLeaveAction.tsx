'use client';

import { useState } from 'react';
import { TeamLeaveDialog } from './TeamLeaveDialog';

interface TeamLeaveActionProps {
  hasActiveMeeting: boolean;
}

export const TeamLeaveAction = ({ hasActiveMeeting }: TeamLeaveActionProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

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
        onOpenChange={setIsDialogOpen}
      />
    </div>
  );
};
