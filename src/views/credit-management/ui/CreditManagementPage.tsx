'use client';

import { useState } from 'react';
import { useTeamDetail } from '@/features/team-management';
import { NavigationSidebar } from '@/widgets/navigation-sidebar';
import { CreditManagementHeader } from './CreditManagementHeader';

interface CreditManagementPageProps {
  teamId: number;
}

export const CreditManagementPage = ({ teamId }: CreditManagementPageProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { data: team } = useTeamDetail(teamId);

  return (
    <div className="flex h-dvh min-h-[844px] flex-col bg-white">
      <CreditManagementHeader isMenuDisabled={!team} onMenuClick={() => setIsSidebarOpen(true)} />

      <div className="flex flex-1 flex-col items-center justify-center px-5 pb-20 text-center">
        <h2 className="text-[17px] font-bold tracking-tight text-cool-900">준비 중이에요</h2>
        <p className="mt-1.5 text-sm text-cool-600">크레딧 내역은 곧 이곳에서 확인할 수 있어요</p>
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
