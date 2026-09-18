import { mockParticipants, mockTeamInfo } from '../model/mock';
import type { TeamMemberRole } from '../model/types';
import { ParticipantListSection } from './ParticipantListSection';
import { TeamInfoSection } from './TeamInfoSection';
import { TeamManagementHeader } from './TeamManagementHeader';

interface TeamManagementPageProps {
  role: TeamMemberRole;
}

export const TeamManagementPage = ({ role }: TeamManagementPageProps) => {
  return (
    <div className="flex min-h-[844px] flex-1 flex-col bg-cool-50">
      <TeamManagementHeader />

      <div className="flex-1 overflow-y-auto">
        <TeamInfoSection role={role} team={mockTeamInfo} />
        <ParticipantListSection role={role} participants={mockParticipants} />
        {/* 차단 목록: 서브 이슈 2에서 이어서 채움 */}
      </div>

      <footer className="shrink-0">
        {role === 'leader' ? (
          <div />
        ) : (
          <div /> // 팀장: 팀 삭제하기 / 팀원: 나가기 — 서브 이슈 2에서 채움
        )}
      </footer>
    </div>
  );
};
