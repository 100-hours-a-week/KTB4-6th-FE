import { cn } from '@/shared/lib';

type VoiceEnrollSentenceStatus = 'waiting' | 'reading' | 'ready' | 'recorded';

const SENTENCE_HINTS: Record<VoiceEnrollSentenceStatus, string> = {
  waiting: '녹음을 시작하면 이 문장부터 읽어 주세요',
  reading: '소리 내어 읽어 주세요',
  ready: '다 읽었다면 다음으로 넘어가 주세요',
  recorded: '이미 녹음한 문장이에요',
};

const SENTENCE_BORDERS: Record<VoiceEnrollSentenceStatus, string> = {
  waiting: 'border-cool-200',
  reading: 'border-brand-200',
  ready: 'border-brand-600',
  recorded: 'border-brand-600',
};

interface VoiceEnrollSentenceCardProps {
  sentence: string;
  status: VoiceEnrollSentenceStatus;
}

export const VoiceEnrollSentenceCard = ({ sentence, status }: VoiceEnrollSentenceCardProps) => (
  <div
    className={cn(
      'flex min-h-[150px] flex-col gap-3 rounded-2xl border-[1.5px] px-5 pt-5 pb-[22px] transition-colors',
      SENTENCE_BORDERS[status],
    )}
  >
    <span className="text-xs leading-none font-semibold text-cool-500">
      {SENTENCE_HINTS[status]}
    </span>
    <p
      key={sentence}
      className="text-[19px] leading-[1.65] font-semibold tracking-[-0.025em] break-keep text-cool-900 motion-safe:animate-in motion-safe:duration-[280ms] motion-safe:ease-out motion-safe:fade-in motion-safe:slide-in-from-right-[18px]"
    >
      {sentence}
    </p>
  </div>
);
