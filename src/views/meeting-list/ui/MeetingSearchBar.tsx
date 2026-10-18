'use client';

import type { FormEvent } from 'react';
import { Search, X } from 'lucide-react';

interface MeetingSearchBarProps {
  query: string;
  onQueryChange: (value: string) => void;
  onClear: () => void;
  onSubmit: () => void;
  onCancel: () => void;
}

export const MeetingSearchBar = ({
  query,
  onQueryChange,
  onClear,
  onSubmit,
  onCancel,
}: MeetingSearchBarProps) => {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit();
  };

  return (
    <div className="flex items-center gap-1.5">
      <form
        role="search"
        noValidate
        onSubmit={handleSubmit}
        className="flex h-[46px] min-w-0 flex-1 items-center gap-0.5 rounded-[10px] border border-cool-200 bg-white pr-[3px] pl-3.5 focus-within:border-brand-600"
      >
        <input
          autoFocus
          aria-label="회의 제목 검색"
          enterKeyHint="search"
          value={query}
          placeholder="회의 제목 검색"
          onChange={(event) => onQueryChange(event.target.value)}
          className="h-full min-w-0 flex-1 bg-transparent text-sm font-medium tracking-[-0.01em] text-cool-900 outline-none placeholder:font-normal placeholder:text-cool-400"
        />
        {query && (
          <button
            type="button"
            aria-label="입력 지우기"
            onClick={onClear}
            className="flex h-10 w-9 shrink-0 items-center justify-center rounded-lg hover:bg-cool-50"
          >
            <span className="flex size-[17px] items-center justify-center rounded-full bg-cool-400">
              <X aria-hidden="true" className="size-2.5 text-white" strokeWidth={2.5} />
            </span>
          </button>
        )}
        <button
          type="submit"
          aria-label="검색하기"
          className="flex size-10 shrink-0 items-center justify-center rounded-lg text-brand-600 hover:bg-cool-50"
        >
          <Search aria-hidden="true" className="size-[19px]" strokeWidth={2} />
        </button>
      </form>

      <button
        type="button"
        onClick={onCancel}
        className="min-h-11 shrink-0 rounded-lg px-1.5 text-[13.5px] font-medium whitespace-nowrap text-cool-600 hover:bg-cool-100"
      >
        취소
      </button>
    </div>
  );
};
