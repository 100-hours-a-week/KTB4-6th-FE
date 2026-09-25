import { Pause, Play, Volume2, VolumeX } from 'lucide-react';
import { formatTimestamp } from '../model/format-timestamp';
import { AudioSeekBar } from './AudioSeekBar';

interface AudioPlayerProps {
  isPlaying: boolean;
  isMuted: boolean;
  canPlay: boolean;
  /** 화면에 보여줄 재생 위치. 진행 바를 끄는 중에는 끄는 위치 */
  displayMs: number;
  durationSeconds: number;
  onTogglePlay: () => void;
  onToggleMute: () => void;
  onSeek: (ms: number) => void;
  onScrubStart: (ms: number) => void;
  onScrubMove: (ms: number) => void;
  onScrubEnd: () => void;
}

export const AudioPlayer = ({
  isPlaying,
  isMuted,
  canPlay,
  displayMs,
  durationSeconds,
  onTogglePlay,
  onToggleMute,
  onSeek,
  onScrubStart,
  onScrubMove,
  onScrubEnd,
}: AudioPlayerProps) => {
  const currentSeconds = Math.min(Math.floor(displayMs / 1000), durationSeconds);

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
      <AudioSeekBar
        valueMs={displayMs}
        durationMs={durationSeconds * 1000}
        isDisabled={!canPlay}
        onSeek={onSeek}
        onScrubStart={onScrubStart}
        onScrubMove={onScrubMove}
        onScrubEnd={onScrubEnd}
      />
      <button
        type="button"
        aria-label={isMuted ? '음소거 해제' : '음소거'}
        aria-pressed={isMuted}
        disabled={!canPlay}
        onClick={onToggleMute}
        className="flex size-8 shrink-0 items-center justify-center text-cool-600 disabled:text-cool-400"
      >
        {isMuted ? (
          <VolumeX aria-hidden="true" className="size-[18px]" strokeWidth={2} />
        ) : (
          <Volume2 aria-hidden="true" className="size-[18px]" strokeWidth={2} />
        )}
      </button>
    </div>
  );
};
