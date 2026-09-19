import { TeamManagementPage } from '@/views/team-management';

interface TeamManageProps {
  params: Promise<{ teamId: string }>;
}

export default async function TeamManage({ params }: TeamManageProps) {
  const { teamId } = await params;

  return <TeamManagementPage teamId={Number(teamId)} />;
}
