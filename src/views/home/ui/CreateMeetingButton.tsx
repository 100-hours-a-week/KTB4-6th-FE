'use client';

import { useRouter } from 'next/navigation';

interface CreateMeetingButtonProps {
  teamId: number;
  activeMeetingId: number | null;
  isDisabled: boolean;
}

export const CreateMeetingButton = ({
  teamId,
  activeMeetingId,
  isDisabled,
}: CreateMeetingButtonProps) => {
  const router = useRouter();
  const hasActiveMeeting = activeMeetingId !== null;

  const handleClick = () => {
    router.push(
      hasActiveMeeting
        ? `/teams/${teamId}/meetings/${activeMeetingId}`
        : `/teams/${teamId}/meetings/new`,
    );
  };

  return (
    <div className="mt-5 px-5">
      <button
        type="button"
        disabled={isDisabled}
        onClick={handleClick}
        className="flex h-14 w-full items-center justify-center rounded-2xl bg-brand-600 text-base font-semibold text-white transition-colors hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-brand-300 active:bg-brand-800 disabled:cursor-not-allowed disabled:bg-cool-200 disabled:text-cool-400"
      >
        {hasActiveMeeting ? '회의 참여하기' : '회의 생성하기'}
      </button>
    </div>
  );
};
