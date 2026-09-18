'use client';

import { Copy, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { useAppToast } from '@/shared/ui';
import { teamManagementToastMessages } from '../model/toast-messages';
import type { TeamInfo, TeamMemberRole } from '../model/types';
import { TeamNameField } from './TeamNameField';

interface TeamInfoSectionProps {
  role: TeamMemberRole;
  team: TeamInfo;
}

export const TeamInfoSection = ({ role, team }: TeamInfoSectionProps) => {
  const isLeader = role === 'leader';
  const [teamName, setTeamName] = useState(team.name);
  const { showToast } = useAppToast();

  const handleSaveTeamName = (name: string) => {
    setTeamName(name);
    const { text, variant } = teamManagementToastMessages.teamNameUpdateSuccess;
    showToast(text, variant);
  };

  return (
    <section className="px-5 pt-5">
      <TeamNameField isEditable={isLeader} name={teamName} onSave={handleSaveTeamName} />

      <div className="mt-4 grid grid-cols-[1.6fr_1fr] gap-3">
        <div className="rounded-xl border border-cool-100 bg-white px-4 py-3">
          <div className="flex items-center justify-between">
            <p className="text-xs text-cool-500">초대코드</p>
            <div className="flex items-center gap-1">
              {isLeader && (
                <button
                  type="button"
                  aria-label="초대 코드 재생성"
                  className="flex size-7 items-center justify-center rounded-full text-cool-500 transition-colors hover:bg-cool-100 hover:text-cool-900"
                >
                  <RefreshCw className="size-3.5" strokeWidth={2} />
                </button>
              )}
              <button
                type="button"
                aria-label="초대 코드 복사"
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
    </section>
  );
};
