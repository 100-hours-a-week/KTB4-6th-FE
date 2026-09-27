import { useState } from 'react';
import { Search, X } from 'lucide-react';
import {
  TRANSCRIPT_SEARCH_KEYWORD_MAX_LENGTH,
  TRANSCRIPT_SEARCH_KEYWORD_MIN_LENGTH,
} from '@/features/meeting';
import type { TranscriptEntry } from '../model/preview-meeting-transcript';
import { TranscriptEmptyState } from './TranscriptEmptyState';
import { TranscriptItem } from './TranscriptItem';

interface TranscriptTabProps {
  meetingId: number;
  entries: TranscriptEntry[];
  isPreview: boolean;
  /** 현재 재생 위치에 해당해 강조할 발화의 ID */
  activeEntryId: string | null;
}

export const TranscriptTab = ({
  meetingId,
  entries,
  isPreview,
  activeEntryId,
}: TranscriptTabProps) => {
  const [searchInput, setSearchInput] = useState('');
  const showClearButton = searchInput.trim().length >= TRANSCRIPT_SEARCH_KEYWORD_MIN_LENGTH;

  return (
    <div className="flex flex-1 flex-col gap-3 px-5 py-5">
      <label className="flex h-12 items-center gap-2.5 rounded-xl border border-cool-200 bg-white px-4">
        <input
          type="search"
          placeholder="대화 검색"
          aria-label="대화 검색"
          value={searchInput}
          maxLength={TRANSCRIPT_SEARCH_KEYWORD_MAX_LENGTH}
          onChange={(event) => setSearchInput(event.target.value)}
          className="min-w-0 flex-1 bg-transparent text-sm text-cool-900 outline-none placeholder:text-cool-500"
        />
        {showClearButton && (
          <button
            type="button"
            aria-label="검색어 지우기"
            onClick={() => setSearchInput('')}
            className="flex size-5 shrink-0 items-center justify-center rounded-full bg-cool-700 text-white"
          >
            <X aria-hidden="true" className="size-3" strokeWidth={2.5} />
          </button>
        )}
        <Search aria-hidden="true" className="size-4 shrink-0 text-cool-500" strokeWidth={2} />
      </label>

      {entries.length === 0 ? (
        <TranscriptEmptyState />
      ) : (
        <ul className="flex flex-col gap-2">
          {entries.map((entry) => (
            <TranscriptItem
              key={entry.id}
              meetingId={meetingId}
              entry={entry}
              isPreview={isPreview}
              isActive={entry.id === activeEntryId}
            />
          ))}
        </ul>
      )}
    </div>
  );
};
