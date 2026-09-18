import { TeamManagementPage } from '@/views/team-management';

interface TeamManageProps {
  params: Promise<{ teamId: string }>;
}

export default async function TeamManage({ params }: TeamManageProps) {
  // UI 전용 구현: teamId로 실제 팀 데이터를 조회하지 않고 목업 데이터를 렌더링한다.
  await params;

  return <TeamManagementPage role="leader" />;
}
