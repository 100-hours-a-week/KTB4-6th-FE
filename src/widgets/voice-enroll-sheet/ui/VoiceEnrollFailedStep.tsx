import { VoiceEnrollResult } from './VoiceEnrollResult';

interface VoiceEnrollFailedStepProps {
  onRetry: () => void;
  onRestart: () => void;
}

export const VoiceEnrollFailedStep = ({ onRetry, onRestart }: VoiceEnrollFailedStepProps) => (
  <VoiceEnrollResult
    title="등록하지 못했어요"
    description={
      <>
        일시적인 문제로 음성 정보를 저장하지 못했어요.
        <br />
        녹음한 내용으로 다시 시도해 볼게요.
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
    <button
      type="button"
      onClick={onRestart}
      className="min-h-12 rounded-xl text-sm font-semibold text-cool-600 transition-colors hover:bg-cool-50"
    >
      처음부터 다시 녹음
    </button>
  </VoiceEnrollResult>
);
