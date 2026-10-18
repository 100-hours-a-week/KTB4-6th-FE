import { memo } from 'react';
import { cn } from '@/shared/lib';
import { formatTimestamp } from '../model/format-timestamp';
import type { TranscriptEntry } from '../model/preview-meeting-transcript';
import { TranscriptSpeakerButton } from './TranscriptSpeakerButton';

interface TranscriptItemProps {
  meetingId: number;
  entry: TranscriptEntry;
  isPreview: boolean;
  isActive: boolean;
  isSearchMatch?: boolean;
  isDeepLinkTarget?: boolean;
}

export const TranscriptItem = memo(
  ({
    meetingId,
    entry,
    isPreview,
    isActive,
    isSearchMatch = false,
    isDeepLinkTarget = false,
  }: TranscriptItemProps) => (
    <li
      data-entry-id={entry.id}
      aria-current={isActive || isSearchMatch || isDeepLinkTarget ? 'true' : undefined}
      className={cn(
        'flex items-start gap-3.5 rounded-2xl px-3 py-3.5 transition-colors',
        isDeepLinkTarget
          ? 'bg-brand-100 ring-2 ring-brand-600 ring-inset'
          : isSearchMatch
            ? 'bg-warning-bg ring-1 ring-warning ring-inset'
            : isActive
              ? 'bg-brand-100 ring-1 ring-brand-300 ring-inset'
              : 'odd:bg-white even:bg-brand-50',
      )}
    >
      <div className="w-[68px] shrink-0">
        <TranscriptSpeakerButton meetingId={meetingId} entry={entry} isPreview={isPreview} />
        <p className="mt-1 font-mono text-xs text-cool-500 tabular-nums">
          {formatTimestamp(Math.floor(entry.startedAtMs / 1000))}
        </p>
      </div>
      <p className="min-w-0 flex-1 text-sm leading-6 break-all text-cool-800">{entry.text}</p>
    </li>
  ),
);
TranscriptItem.displayName = 'TranscriptItem';
