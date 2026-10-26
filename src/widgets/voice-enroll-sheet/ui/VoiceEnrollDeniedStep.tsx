import { VoiceEnrollResult } from './VoiceEnrollResult';

interface VoiceEnrollDeniedStepProps {
  onRetry: () => void;
}

export const VoiceEnrollDeniedStep = ({ onRetry }: VoiceEnrollDeniedStepProps) => (
  <VoiceEnrollResult
    title="마이크 권한이 필요해요"
    description={
      <>
        목소리를 녹음하려면 마이크 접근을 허용해 주세요.
        <br />
        주소창 왼쪽 자물쇠 아이콘에서 허용할 수 있어요.
      </>
    }
  >
    <button
      type="button"
      onClick={onRetry}
      className="min-h-[52px] rounded-xl bg-brand-600 text-[15px] font-semibold text-white transition-colors hover:bg-brand-700"
    >
      다시 시도
    </button>
  </VoiceEnrollResult>
);
