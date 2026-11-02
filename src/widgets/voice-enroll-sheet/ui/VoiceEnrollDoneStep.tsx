import Image from 'next/image';
import type { VoiceEnrollMode } from '../model/types';
import { VoiceEnrollResult } from './VoiceEnrollResult';

interface VoiceEnrollDoneStepProps {
  mode: VoiceEnrollMode;
  onDone: () => void;
}

export const VoiceEnrollDoneStep = ({ mode, onDone }: VoiceEnrollDoneStepProps) => (
  <VoiceEnrollResult
    image={
      <Image
        src="/brand/mascot/meety-01-excited-transparent.png"
        alt=""
        width={132}
        height={132}
        className="size-[132px] object-contain"
      />
    }
    title={mode === 'first' ? '등록 완료!' : '음성 정보를 새로 등록했어요'}
    description={
      <>
        이제 회의록에서
        <br />내 발언을 구분할 수 있어요.
      </>
    }
  >
    <button
      type="button"
      onClick={onDone}
      className="min-h-[52px] rounded-xl bg-brand-600 text-[15px] font-semibold text-white transition-colors hover:bg-brand-700"
    >
      {mode === 'first' ? '시작하기' : '확인'}
    </button>
  </VoiceEnrollResult>
);
