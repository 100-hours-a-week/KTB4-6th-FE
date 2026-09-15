import { WelcomePage } from '@/views/welcome';

interface WelcomeProps {
  searchParams: Promise<{ teamSpace?: string | string[] }>;
}

export default async function Welcome({ searchParams }: WelcomeProps) {
  const { teamSpace } = await searchParams;

  return <WelcomePage />;
}
