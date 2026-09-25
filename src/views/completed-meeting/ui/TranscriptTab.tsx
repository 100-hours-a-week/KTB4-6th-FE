import { Search } from 'lucide-react';
import type { TranscriptEntry } from '../model/preview-meeting-transcript';
import { TranscriptItem } from './TranscriptItem';

interface TranscriptTabProps {
  entries: TranscriptEntry[];
}

// TODO: 검색어 입력에 맞춰 전사 목록을 거른다.
export const TranscriptTab = ({ entries }: TranscriptTabProps) => (
  <div className="flex flex-col gap-3 px-5 py-5">
    <label className="flex h-12 items-center gap-2.5 rounded-xl border border-cool-200 bg-white px-4">
      <Search aria-hidden="true" className="size-4 shrink-0 text-cool-500" strokeWidth={2} />
      <input
        type="search"
        placeholder="대화 검색"
        aria-label="대화 검색"
        className="min-w-0 flex-1 bg-transparent text-sm text-cool-900 outline-none placeholder:text-cool-500"
      />
    </label>

    <ul className="flex flex-col gap-2">
      {entries.map((entry) => (
        <TranscriptItem key={entry.id} entry={entry} />
      ))}
    </ul>
  </div>
);
