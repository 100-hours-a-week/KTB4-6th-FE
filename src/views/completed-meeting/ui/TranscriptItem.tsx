import { formatTimestamp } from '../model/format-timestamp';
import type { TranscriptEntry } from '../model/preview-meeting-transcript';
import { TranscriptSpeakerButton } from './TranscriptSpeakerButton';

interface TranscriptItemProps {
  entry: TranscriptEntry;
}

export const TranscriptItem = ({ entry }: TranscriptItemProps) => (
  <li className="flex items-start gap-3.5 rounded-2xl px-3 py-3.5 odd:bg-white even:bg-brand-50">
    <div className="w-[68px] shrink-0">
      <TranscriptSpeakerButton entry={entry} />
      <p className="mt-1 font-mono text-xs text-cool-500 tabular-nums">
        {formatTimestamp(entry.startedAtSeconds)}
      </p>
    </div>
    <p className="min-w-0 flex-1 text-sm leading-6 break-all text-cool-800">{entry.text}</p>
  </li>
);
