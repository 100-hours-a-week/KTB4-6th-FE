import { HomePage } from '@/views/home';

interface TeamHomeProps {
  params: Promise<{ teamId: string }>;
  searchParams: Promise<{ notice?: string | string[] }>;
}

export default async function TeamHome({ params, searchParams }: TeamHomeProps) {
  const { teamId } = await params;
  const { notice } = await searchParams;

  return (
    <HomePage teamId={Number(teamId)} notice={typeof notice === 'string' ? notice : undefined} />
  );
}
