import { VoiceEnrollResult } from './VoiceEnrollResult';

interface VoiceEnrollUnavailableStepProps {
  reason: 'unsupported' | 'unavailable';
  onRetry: () => void;
}

export const VoiceEnrollUnavailableStep = ({ reason, onRetry }: VoiceEnrollUnavailableStepProps) =>
  reason === 'unsupported' ? (
    <VoiceEnrollResult
      title="지원하지 않는 브라우저예요"
      description={
        <>
          최신 버전의 Chrome이나 Safari에서
          <br />
          다시 시도해 주세요.
        </>
      }
    />
  ) : (
    <VoiceEnrollResult
      title="마이크를 사용할 수 없어요"
      description={
        <>
          마이크가 연결되어 있는지, 다른 앱에서
          <br />
          사용 중이지 않은지 확인해 주세요.
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
