import { VoiceConsentPage } from '@/views/voice-consent';

interface VoiceConsentRouteProps {
  params: Promise<{ teamId: string }>;
  searchParams: Promise<{ view?: string | string[] }>;
}

export default async function VoiceConsentRoute({ params, searchParams }: VoiceConsentRouteProps) {
  const { teamId } = await params;
  const { view } = await searchParams;

  return <VoiceConsentPage teamId={Number(teamId)} isFullView={view === 'full'} />;
}
