'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/shared/lib';
import type { TranscriptSegment } from '../model/preview-meeting';

interface MeetingTranscriptProps {
  segments: TranscriptSegment[];
  isRecording: boolean;
  isPaused: boolean;
}

const formatTimestamp = (seconds: number) =>
  [Math.floor(seconds / 60), seconds % 60].map((part) => String(part).padStart(2, '0')).join(':');

const HIGHLIGHT_DURATION_MS = 1200;

export const MeetingTranscript = ({ segments, isRecording, isPaused }: MeetingTranscriptProps) => {
  const previousSegmentCount = useRef(segments.length);
  const [highlightedSegmentId, setHighlightedSegmentId] = useState<string | null>(null);
  const latestSegmentId = segments.at(-1)?.id;

  useEffect(() => {
    const hasNewSegment = segments.length > previousSegmentCount.current;
    previousSegmentCount.current = segments.length;

    if (!hasNewSegment || !latestSegmentId) return;

    let timeoutId: number | undefined;
    const frameId = window.requestAnimationFrame(() => {
      setHighlightedSegmentId(latestSegmentId);
      timeoutId = window.setTimeout(() => setHighlightedSegmentId(null), HIGHLIGHT_DURATION_MS);
    });

    return () => {
      window.cancelAnimationFrame(frameId);
      if (timeoutId !== undefined) window.clearTimeout(timeoutId);
    };
  }, [latestSegmentId, segments.length]);

  return (
    <main className="flex min-h-0 flex-1 flex-col overflow-y-auto px-5 py-4">
      <h3 className="flex items-center gap-2 text-sm font-bold text-cool-900">
        실시간 녹취
        {isRecording && <span aria-hidden="true" className="size-1.5 rounded-full bg-danger" />}
      </h3>

      <ol className="mt-2 flex flex-col gap-1.5">
        {segments.map((segment) => (
          <li
            key={segment.id}
            className={cn(
              'grid grid-cols-[76px_minmax(0,1fr)] gap-2 rounded-xl border border-transparent bg-white p-3 transition-colors duration-700',
              highlightedSegmentId === segment.id && 'border-brand-200 bg-brand-50',
            )}
          >
            <div className="min-w-0">
              <p className="text-xs font-semibold text-brand-600">
                {segment.speakerNumber === null
                  ? '발화자 확인 중'
                  : '발화자 ' + segment.speakerNumber}
              </p>
              <time className="mt-1 block font-mono text-xs text-cool-500">
                {formatTimestamp(segment.startedAtSeconds)}
              </time>
            </div>
            <p className="text-sm leading-6 break-keep text-cool-900">{segment.text}</p>
          </li>
        ))}
      </ol>

      {segments.length === 0 && (
        <p className="flex flex-1 items-center justify-center text-center text-sm text-cool-500">
          아직 녹취된 내용이 없습니다.
        </p>
      )}

      {isPaused && (
        <p className="mt-2 rounded-xl bg-cool-100 px-3 py-3 text-center text-xs text-cool-600">
          일시정지 중에는 새로운 녹취가 기록되지 않습니다
        </p>
      )}
    </main>
  );
};
