'use client';

import { useState } from 'react';
import { useTeamCredits, useTeamDetail } from '@/features/team-management';
import { NavigationSidebar } from '@/widgets/navigation-sidebar';
import { CreditManagementHeader } from './CreditManagementHeader';

interface CreditManagementPageProps {
  teamId: number;
}

export const CreditManagementPage = ({ teamId }: CreditManagementPageProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { data: team } = useTeamDetail(teamId);
  const {
    data: credits,
    isPending: isCreditsPending,
    isError: isCreditsError,
  } = useTeamCredits(teamId);

  return (
    <div className="flex h-dvh min-h-[844px] flex-col bg-white">
      <CreditManagementHeader isMenuDisabled={!team} onMenuClick={() => setIsSidebarOpen(true)} />

      <div className="flex flex-1 flex-col items-center justify-center px-5 pb-20 text-center">
        {isCreditsPending ? (
          <p className="text-sm text-cool-600">크레딧 정보를 불러오고 있어요</p>
        ) : isCreditsError || !credits ? (
          <p className="text-sm text-cool-600">크레딧 정보를 불러오지 못했어요</p>
        ) : (
          <>
            <h2 className="text-[17px] font-bold tracking-tight text-cool-900">
              {credits.balance.toLocaleString()} 크레딧
            </h2>
            <p className="mt-1.5 text-sm text-cool-600">
              최대 {credits.maxBalance.toLocaleString()} 크레딧
            </p>
          </>
        )}
      </div>

      {team && (
        <NavigationSidebar
          isOpen={isSidebarOpen}
          onOpenChange={setIsSidebarOpen}
          teamId={teamId}
          teamName={team.name}
        />
      )}
    </div>
  );
};
