import { memo } from 'react';
import { cn } from '@/shared/lib';
import { formatTimestamp } from '../model/format-timestamp';
import type { TranscriptEntry } from '../model/preview-meeting-transcript';
import { TranscriptSpeakerButton } from './TranscriptSpeakerButton';

interface TranscriptItemProps {
  entry: TranscriptEntry;
  /** 현재 재생 위치에 해당하는 발화 */
  isActive: boolean;
}

// 재생 중에는 재생 위치가 자주 바뀌므로, 강조 여부가 바뀐 항목만 다시 그리도록 memo로 감싼다.
export const TranscriptItem = memo(({ entry, isActive }: TranscriptItemProps) => (
  <li
    data-entry-id={entry.id}
    aria-current={isActive ? 'true' : undefined}
    className={cn(
      'flex items-start gap-3.5 rounded-2xl px-3 py-3.5 transition-colors',
      isActive ? 'bg-brand-100 ring-1 ring-brand-300 ring-inset' : 'odd:bg-white even:bg-brand-50',
    )}
  >
    <div className="w-[68px] shrink-0">
      <TranscriptSpeakerButton entry={entry} />
      <p className="mt-1 font-mono text-xs text-cool-500 tabular-nums">
        {formatTimestamp(Math.floor(entry.startedAtMs / 1000))}
      </p>
    </div>
    <p className="min-w-0 flex-1 text-sm leading-6 break-all text-cool-800">{entry.text}</p>
  </li>
));
TranscriptItem.displayName = 'TranscriptItem';
