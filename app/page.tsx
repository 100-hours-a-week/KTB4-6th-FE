import { HomePage } from '@/views/home';

interface HomeProps {
  searchParams: Promise<{ teamSpace?: string | string[] }>;
}

export default async function Home({ searchParams }: HomeProps) {
  const { teamSpace } = await searchParams;

  return (
    <HomePage authState="authenticated" isTeamSpaceSheetInitiallyOpen={teamSpace === 'start'} />
  );
}
