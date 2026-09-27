'use client';

import { useRef, type KeyboardEvent, type PointerEvent } from 'react';
import { formatTimestamp } from '../model/format-timestamp';

const ARROW_STEP_MS = 5_000;
const PAGE_STEP_MS = 30_000;

interface AudioSeekBarProps {
  valueMs: number;
  durationMs: number;
  isDisabled: boolean;
  onSeek: (ms: number) => void;
  onScrubStart: (ms: number) => void;
  onScrubMove: (ms: number) => void;
  onScrubEnd: () => void;
}

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

/**
 * 재생 위치를 보여주고 옮기는 진행 바.
 * 누르거나 끌면 위치를 옮기고(끄는 동안은 미리 보여주기만 하고 손을 뗄 때 이동), 키보드로도 옮길 수 있다.
 */
export const AudioSeekBar = ({
  valueMs,
  durationMs,
  isDisabled,
  onSeek,
  onScrubStart,
  onScrubMove,
  onScrubEnd,
}: AudioSeekBarProps) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const progressPercent = durationMs > 0 ? clamp((valueMs / durationMs) * 100, 0, 100) : 0;

  const getMsFromPointer = (event: PointerEvent<HTMLDivElement>) => {
    const rect = trackRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0) return 0;

    return Math.round(clamp((event.clientX - rect.left) / rect.width, 0, 1) * durationMs);
  };

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (isDisabled) return;

    event.currentTarget.setPointerCapture(event.pointerId);
    onScrubStart(getMsFromPointer(event));
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;

    onScrubMove(getMsFromPointer(event));
  };

  const handlePointerEnd = (event: PointerEvent<HTMLDivElement>) => {
    if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;

    event.currentTarget.releasePointerCapture(event.pointerId);
    onScrubEnd();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (isDisabled) return;

    const nextMs = {
      ArrowRight: valueMs + ARROW_STEP_MS,
      ArrowUp: valueMs + ARROW_STEP_MS,
      ArrowLeft: valueMs - ARROW_STEP_MS,
      ArrowDown: valueMs - ARROW_STEP_MS,
      PageUp: valueMs + PAGE_STEP_MS,
      PageDown: valueMs - PAGE_STEP_MS,
      Home: 0,
      End: durationMs,
    }[event.key];
    if (nextMs === undefined) return;

    event.preventDefault();
    onSeek(clamp(nextMs, 0, durationMs));
  };

  const valueSeconds = Math.floor(valueMs / 1000);
  const durationSeconds = Math.floor(durationMs / 1000);

  return (
    <div
      role="slider"
      tabIndex={isDisabled ? -1 : 0}
      aria-label="재생 위치"
      aria-disabled={isDisabled}
      aria-valuemin={0}
      aria-valuemax={durationSeconds}
      aria-valuenow={valueSeconds}
      aria-valuetext={`${formatTimestamp(valueSeconds)} / ${formatTimestamp(durationSeconds)}`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerEnd}
      onPointerCancel={handlePointerEnd}
      onKeyDown={handleKeyDown}
      className="flex h-8 min-w-0 flex-1 touch-none items-center rounded-full outline-none select-none focus-visible:ring-2 focus-visible:ring-brand-300 aria-disabled:opacity-50 not-aria-disabled:cursor-pointer"
    >
      <div ref={trackRef} className="relative h-1 w-full rounded-full bg-cool-200">
        <div
          className="h-full rounded-full bg-brand-600"
          style={{ width: `${progressPercent}%` }}
        />
        <span
          aria-hidden="true"
          className="absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-600"
          style={{ left: `${progressPercent}%` }}
        />
      </div>
    </div>
  );
};
