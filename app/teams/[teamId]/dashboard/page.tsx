import { DashboardPage } from '@/views/dashboard';

interface DashboardProps {
  params: Promise<{ teamId: string }>;
}

export default async function Dashboard({ params }: DashboardProps) {
  const { teamId } = await params;

  return <DashboardPage teamId={Number(teamId)} />;
}
