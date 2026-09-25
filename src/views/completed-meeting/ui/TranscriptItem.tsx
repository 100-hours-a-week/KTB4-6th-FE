import { Link2 } from 'lucide-react';
import { cn } from '@/shared/lib';
import { formatTranscriptTime } from '../model/format-transcript-time';
import type { TranscriptEntry } from '../model/preview-meeting-transcript';

interface TranscriptItemProps {
  entry: TranscriptEntry;
}

// TODO: 발화자를 누르면 팀 멤버 연결 모달을 연다.
export const TranscriptItem = ({ entry }: TranscriptItemProps) => (
  <li className="flex items-start gap-3.5 rounded-2xl px-3 py-3.5 odd:bg-white even:bg-brand-50">
    <div className="w-[68px] shrink-0">
      <p
        className={cn(
          'flex items-center gap-1 text-[13px] font-bold whitespace-nowrap',
          entry.isSpeakerLinked ? 'text-cool-900' : 'text-brand-500',
        )}
      >
        {entry.speakerLabel}
        {!entry.isSpeakerLinked && (
          <Link2 aria-label="팀 멤버 미연결" className="size-3.5 shrink-0" strokeWidth={2} />
        )}
      </p>
      <p className="mt-1 font-mono text-xs text-cool-500 tabular-nums">
        {formatTranscriptTime(entry.startedAtSeconds)}
      </p>
    </div>
    <p className="min-w-0 flex-1 text-sm leading-6 break-all text-cool-800">{entry.text}</p>
  </li>
);
