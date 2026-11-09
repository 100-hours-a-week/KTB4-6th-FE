import { memo } from 'react';
import { cn } from '@/shared/lib';
import type { TranscriptSegment } from '../model/current-meeting';

const formatTimestamp = (seconds: number) =>
  [Math.floor(seconds / 60), seconds % 60].map((part) => String(part).padStart(2, '0')).join(':');

interface TranscriptChunkProps {
  segments: TranscriptSegment[];
  latestHighlightedSegmentId: string | null;
  citationHighlightedSegmentId: string | null;
}

const isSameSegment = (previous: TranscriptSegment, next: TranscriptSegment) =>
  previous === next ||
  (previous.id === next.id &&
    previous.text === next.text &&
    previous.speakerName === next.speakerName &&
    previous.startedAtSeconds === next.startedAtSeconds);

const areChunkPropsEqual = (previous: TranscriptChunkProps, next: TranscriptChunkProps) =>
  previous.latestHighlightedSegmentId === next.latestHighlightedSegmentId &&
  previous.citationHighlightedSegmentId === next.citationHighlightedSegmentId &&
  previous.segments.length === next.segments.length &&
  previous.segments.every((segment, index) => isSameSegment(segment, next.segments[index]));

export const TranscriptChunk = memo(
  ({
    segments,
    latestHighlightedSegmentId,
    citationHighlightedSegmentId,
  }: TranscriptChunkProps) => (
    <ol className="flex flex-col gap-1.5 [contain-intrinsic-size:auto_4052px] [content-visibility:auto]">
      {segments.map((segment) => (
        <li
          key={segment.id}
          data-transcript-segment-id={segment.id}
          className={cn(
            'grid grid-cols-[76px_minmax(0,1fr)] gap-2 rounded-xl border border-transparent bg-white p-3 transition-colors duration-700',
            latestHighlightedSegmentId === segment.id && 'border-brand-200 bg-brand-50',
            citationHighlightedSegmentId === segment.id &&
              'border-brand-400 bg-brand-100 ring-1 ring-brand-400',
          )}
        >
          <div className="min-w-0">
            <p className="text-xs font-semibold break-keep text-brand-600">
              {segment.speakerName ?? '발화자 확인 중'}
            </p>
            <time className="mt-1 block font-mono text-xs text-cool-500">
              {formatTimestamp(segment.startedAtSeconds)}
            </time>
          </div>
          <p className="text-sm leading-6 break-keep text-cool-900">{segment.text}</p>
        </li>
      ))}
    </ol>
  ),
  areChunkPropsEqual,
);
TranscriptChunk.displayName = 'TranscriptChunk';
