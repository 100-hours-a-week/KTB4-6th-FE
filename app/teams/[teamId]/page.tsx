import { HomePage } from '@/views/home';

interface TeamHomeProps {
  params: Promise<{ teamId: string }>;
}

export default async function TeamHome({ params }: TeamHomeProps) {
  const { teamId } = await params;

  return <HomePage teamId={Number(teamId)} />;
}
