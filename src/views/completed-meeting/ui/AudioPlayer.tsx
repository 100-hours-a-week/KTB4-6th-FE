import { Pause, Play, Volume2 } from 'lucide-react';
import { formatTimestamp } from '../model/format-timestamp';

interface AudioPlayerProps {
  isPlaying: boolean;
  canPlay: boolean;
  currentMs: number;
  durationSeconds: number;
  onTogglePlay: () => void;
}

// TODO: 진행 바 탐색과 볼륨 조절을 연결한다.
export const AudioPlayer = ({
  isPlaying,
  canPlay,
  currentMs,
  durationSeconds,
  onTogglePlay,
}: AudioPlayerProps) => {
  const currentSeconds = Math.min(Math.floor(currentMs / 1000), durationSeconds);
  const progressPercent = durationSeconds > 0 ? (currentMs / 1000 / durationSeconds) * 100 : 0;
  const clampedProgressPercent = Math.min(100, progressPercent);

  return (
    <div className="flex shrink-0 items-center gap-3 border-t border-cool-200 bg-white px-5 py-3.5">
      <button
        type="button"
        aria-label={isPlaying ? '일시정지' : '재생'}
        disabled={!canPlay}
        onClick={onTogglePlay}
        className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-600 text-white disabled:bg-cool-200 disabled:text-cool-400"
      >
        {isPlaying ? (
          <Pause aria-hidden="true" className="size-4 fill-current" strokeWidth={2} />
        ) : (
          <Play aria-hidden="true" className="size-4 translate-x-px fill-current" strokeWidth={2} />
        )}
      </button>
      <span className="font-mono text-sm whitespace-nowrap text-cool-600 tabular-nums">
        {formatTimestamp(currentSeconds)} / {formatTimestamp(durationSeconds)}
      </span>
      <div
        role="progressbar"
        aria-label="재생 위치"
        aria-valuemin={0}
        aria-valuemax={durationSeconds}
        aria-valuenow={currentSeconds}
        className="relative h-1 min-w-0 flex-1 rounded-full bg-cool-200"
      >
        <div
          className="h-full rounded-full bg-brand-600"
          style={{ width: `${clampedProgressPercent}%` }}
        />
        <span
          aria-hidden="true"
          className="absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-600"
          style={{ left: `${clampedProgressPercent}%` }}
        />
      </div>
      <button
        type="button"
        aria-label="볼륨"
        className="flex size-8 shrink-0 items-center justify-center text-cool-600"
      >
        <Volume2 aria-hidden="true" className="size-[18px]" strokeWidth={2} />
      </button>
    </div>
  );
};
