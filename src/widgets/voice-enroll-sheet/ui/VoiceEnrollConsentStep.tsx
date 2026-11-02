import Link from 'next/link';
import { VoiceEnrollResult } from './VoiceEnrollResult';

interface VoiceEnrollConsentStepProps {
  consentHref?: string;
}

export const VoiceEnrollConsentStep = ({ consentHref }: VoiceEnrollConsentStepProps) => (
  <VoiceEnrollResult
    title="음성 수집 동의가 필요해요"
    description={
      <>
        목소리를 등록하려면 음성 정보 수집에
        <br />
        먼저 동의해 주세요.
      </>
    }
  >
    {consentHref && (
      <Link
        href={consentHref}
        className="flex min-h-12 items-center justify-center rounded-xl bg-brand-600 font-semibold text-white"
      >
        음성 수집 동의하기
      </Link>
    )}
  </VoiceEnrollResult>
);
