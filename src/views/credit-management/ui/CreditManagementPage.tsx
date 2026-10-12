'use client';

import { useState } from 'react';
import { useTeamCredits, useTeamDetail } from '@/features/team-management';
import { NavigationSidebar } from '@/widgets/navigation-sidebar';
import { CreditBalanceCard } from './CreditBalanceCard';
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
    <div className="flex h-dvh min-h-[844px] flex-col bg-cool-50">
      <CreditManagementHeader isMenuDisabled={!team} onMenuClick={() => setIsSidebarOpen(true)} />

      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
        {isCreditsPending ? (
          <p className="m-auto text-sm text-cool-600">크레딧 정보를 불러오고 있어요</p>
        ) : isCreditsError || !credits ? (
          <p className="m-auto text-sm text-cool-600">크레딧 정보를 불러오지 못했어요</p>
        ) : (
          <>
            <div className="border-b border-cool-200 p-5">
              <CreditBalanceCard balance={credits.balance} maxBalance={credits.maxBalance} />
            </div>
            <div className="flex flex-1 flex-col items-center justify-center px-5 py-16 text-center">
              <h2 className="text-[17px] font-bold tracking-tight text-cool-900">준비 중이에요</h2>
              <p className="mt-1.5 text-sm text-cool-600">
                크레딧 내역은 곧 이곳에서 확인할 수 있어요
              </p>
            </div>
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
