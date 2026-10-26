import { Drawer } from '@base-ui/react/drawer';
import { Mic } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/shared/lib';
import type { VoiceEnrollMode, VoiceEnrollScriptPhase } from '../model/types';
import { VOICE_ENROLL_SCRIPT } from '../model/voice-enroll-script';
import { VoiceEnrollProgress } from './VoiceEnrollProgress';
import { VoiceEnrollSentenceCard } from './VoiceEnrollSentenceCard';
import { VoiceEnrollWave } from './VoiceEnrollWave';

const formatElapsed = (seconds: number) =>
  [Math.floor(seconds / 60), seconds % 60].map((part) => String(part).padStart(2, '0')).join(':');

interface VoiceEnrollScriptStepProps {
  mode: VoiceEnrollMode;
  phase: VoiceEnrollScriptPhase;
  hasCloseButton: boolean;
  sentenceIndex: number;
  sentenceProgress: number;
  elapsedSeconds: number;
  waveLevels: readonly number[];
  onStart: () => void;
  onNext: () => void;
}

export const VoiceEnrollScriptStep = ({
  mode,
  phase,
  hasCloseButton,
  sentenceIndex,
  sentenceProgress,
  elapsedSeconds,
  waveLevels,
  onStart,
  onNext,
}: VoiceEnrollScriptStepProps) => {
  const isRecording = phase === 'recording';
  const isProcessing = phase === 'processing';
  const isReady = isProcessing || (isRecording && sentenceProgress >= 1);
  const isLastSentence = sentenceIndex === VOICE_ENROLL_SCRIPT.length - 1;
  const progressRatios = VOICE_ENROLL_SCRIPT.map((_, index) => {
    if (isProcessing || index < sentenceIndex) return 1;
    if (index === sentenceIndex && isRecording) return sentenceProgress;
    return 0;
  });
  const nextLabel = !isReady ? '천천히 읽어 주세요' : isLastSentence ? '녹음 완료' : '다음 문장';

  return (
    <>
      <div className={cn('flex items-start gap-3', hasCloseButton && 'pr-8')}>
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          {mode === 'first' && (
            <span className="text-xs leading-none font-semibold text-brand-600">
              처음 한 번만 필요해요
            </span>
          )}
          <Drawer.Title className="text-[21px] leading-[1.35] font-bold tracking-[-0.035em] text-cool-900">
            {mode === 'first' ? '내 목소리를 등록해 주세요' : '목소리를 다시 등록해요'}
          </Drawer.Title>
          <Drawer.Description className="text-[13.5px] leading-[1.6] text-cool-600">
            {mode === 'first' ? (
              <>
                등록한 목소리는 회의록에서
                <br />내 발언을 구분하는 데 써요.
              </>
            ) : (
              <>
                3문장을 처음부터 다시 녹음해요.
                <br />
                새로 등록하면 이전 음성 정보는 바뀌어요.
              </>
            )}
          </Drawer.Description>
        </div>
        {mode === 'first' && (
          <Image
            src="/brand/mascot/meety-09-microphone-transparent.png"
            alt=""
            width={80}
            height={80}
            className="-mt-2 size-20 shrink-0"
          />
        )}
      </div>

      <div className="flex items-center gap-2.5 rounded-[10px] bg-brand-50 px-[13px] py-[11px]">
        <Mic aria-hidden="true" className="size-[18px] shrink-0 text-brand-600" strokeWidth={1.6} />
        <span className="text-[12.5px] leading-[1.5] font-medium text-brand-600">
          실제 회의를 진행하는 공간, 녹음 기기에서
          <br />
          하면 인식률이 높아져요
        </span>
      </div>

      <div className="flex flex-col gap-3">
        <VoiceEnrollProgress ratios={progressRatios} currentStep={sentenceIndex + 1} />
        <VoiceEnrollSentenceCard
          sentence={VOICE_ENROLL_SCRIPT[sentenceIndex]}
          status={!isRecording && !isProcessing ? 'waiting' : isReady ? 'ready' : 'reading'}
        />
      </div>

      <div className="flex min-h-[118px] flex-col items-center justify-end gap-3">
        {phase === 'idle' && (
          <>
            <button
              type="button"
              aria-label="녹음 시작"
              onClick={onStart}
              className="flex size-[72px] items-center justify-center rounded-full bg-brand-600 text-white shadow-[0_0_0_8px_var(--color-brand-100)] transition-transform active:scale-95"
            >
              <Mic aria-hidden="true" className="size-7" strokeWidth={1.8} />
            </button>
            <span className="mt-1 text-[13px] leading-none font-medium text-cool-600">
              탭해서 녹음 시작
            </span>
          </>
        )}

        {isRecording && (
          <>
            <div className="flex items-center gap-2.5">
              <span aria-hidden="true" className="size-2 rounded-full bg-danger" />
              <VoiceEnrollWave levels={waveLevels} />
              <span className="text-sm leading-none font-semibold text-danger tabular-nums">
                {formatElapsed(elapsedSeconds)}
              </span>
            </div>
            <button
              type="button"
              disabled={!isReady}
              onClick={onNext}
              className="min-h-[54px] w-full rounded-xl bg-brand-600 text-[15px] font-semibold text-white transition-colors duration-200 disabled:bg-cool-100 disabled:text-cool-400"
            >
              {nextLabel}
            </button>
          </>
        )}

        {isProcessing && (
          <>
            <div className="flex size-[72px] items-center justify-center">
              <span
                aria-hidden="true"
                className="size-11 rounded-full border-[3.5px] border-brand-100 border-t-brand-600 motion-safe:animate-spin"
              />
            </div>
            <span role="status" className="text-[13px] leading-none font-medium text-cool-600">
              목소리를 등록하고 있어요
            </span>
          </>
        )}
      </div>
    </>
  );
};
