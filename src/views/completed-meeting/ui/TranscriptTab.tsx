import { ChevronRight, Search, X } from 'lucide-react';
import {
  TRANSCRIPT_SEARCH_KEYWORD_MAX_LENGTH,
  TRANSCRIPT_SEARCH_KEYWORD_MIN_LENGTH,
} from '@/features/meeting';
import { useTranscriptSearch } from '../model/useTranscriptSearch';
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
  const {
    searchInput,
    setSearchInput,
    submitSearch,
    clearSearch,
    keyword,
    currentMatchId,
    matchCount,
    matchPosition,
    goToNextMatch,
  } = useTranscriptSearch({ meetingId, entries });
  const showClearButton = searchInput.trim().length >= TRANSCRIPT_SEARCH_KEYWORD_MIN_LENGTH;

  return (
    <div className="flex flex-1 flex-col px-5 py-5">
      <div className="sticky top-0 z-10 flex flex-col gap-3 pb-3">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            submitSearch();
          }}
          className="flex h-12 items-center gap-2.5 rounded-xl border border-cool-200 bg-white px-4"
        >
          <input
            type="text"
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
              onClick={clearSearch}
              className="flex size-5 shrink-0 items-center justify-center rounded-full bg-cool-700 text-white"
            >
              <X aria-hidden="true" className="size-3" strokeWidth={2.5} />
            </button>
          )}
          <button type="submit" aria-label="검색">
            <Search aria-hidden="true" className="size-4 shrink-0 text-cool-500" strokeWidth={2} />
          </button>
        </form>

        {keyword && (
          <div className="flex items-center justify-between text-xs text-cool-600">
            {matchCount > 0 ? (
              <>
                <span className="font-mono tabular-nums">
                  {matchPosition}/{matchCount}
                </span>
                <button
                  type="button"
                  onClick={goToNextMatch}
                  className="flex items-center gap-0.5 rounded-lg px-2 py-1 font-medium text-cool-700 hover:bg-cool-100"
                >
                  다음
                  <ChevronRight aria-hidden="true" className="size-3.5" strokeWidth={2.4} />
                </button>
              </>
            ) : (
              <span>검색 결과가 없습니다</span>
            )}
          </div>
        )}
      </div>

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
              isSearchMatch={entry.id === currentMatchId}
            />
          ))}
        </ul>
      )}
    </div>
  );
};
