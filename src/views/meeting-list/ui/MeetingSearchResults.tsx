'use client';

import type { RefObject } from 'react';
import { Search } from 'lucide-react';
import type {
  Meeting,
  MeetingListLoadMoreStatus,
  MeetingListStatus,
  MeetingMenuActions,
} from '../model/type';
import { MeetingCard } from './MeetingCard';
import { MeetingListLoadMore } from './MeetingListLoadMore';

interface MeetingSearchResultsProps {
  keyword: string;
  status: MeetingListStatus;
  meetings: Meeting[];
  teamId: number;
  getMenuActions: (meeting: Meeting) => MeetingMenuActions;
  hasMore: boolean;
  loadMoreStatus: MeetingListLoadMoreStatus;
  onLoadMore: () => void;
  scrollRootRef: RefObject<HTMLDivElement | null>;
}

export const MeetingSearchResults = ({
  keyword,
  status,
  meetings,
  teamId,
  getMenuActions,
  hasMore,
  loadMoreStatus,
  onLoadMore,
  scrollRootRef,
}: MeetingSearchResultsProps) => {
  if (status === 'loading') {
    return (
      <div role="status" aria-label="검색 결과를 불러오는 중" className="motion-safe:animate-pulse">
        <div className="flex h-6 items-center">
          <div className="h-5 w-16 rounded-md bg-cool-100" />
        </div>
        <div className="mt-3 flex flex-col gap-2">
          {[0, 1, 2].map((index) => (
            <div key={index} className="h-[78px] rounded-xl bg-cool-100" />
          ))}
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <section
        role="alert"
        className="flex flex-col items-center rounded-2xl border border-cool-200 bg-white px-4 py-8 text-center"
      >
        <h2 className="text-base font-bold text-cool-900">검색 결과를 불러오지 못했어요</h2>
        <p className="mt-2 text-sm leading-6 text-cool-600">잠시 후 다시 시도해주세요.</p>
      </section>
    );
  }

  if (meetings.length === 0 && !hasMore) {
    return (
      <div className="flex flex-col items-center pt-16 text-center">
        <div
          aria-hidden="true"
          className="flex size-13 items-center justify-center rounded-[14px] bg-cool-100"
        >
          <Search className="size-6 text-cool-400" strokeWidth={1.8} />
        </div>
        <h2 className="mt-4 max-w-[280px] text-[15px] leading-normal font-semibold tracking-[-0.02em] [overflow-wrap:anywhere] text-cool-900">
          ‘{keyword}’ 검색 결과가 없어요
        </h2>
        <p className="mt-1.5 text-[12.5px] leading-[1.65] text-cool-600">
          회의 제목만 검색됩니다.
          <br />
          다른 단어로 다시 검색해보세요.
        </p>
      </div>
    );
  }

  return (
    <>
      <h2 className="text-base font-bold text-cool-900">검색 결과</h2>
      <ul className="mt-3 flex flex-col gap-2">
        {meetings.map((meeting) => (
          <li key={meeting.id}>
            <MeetingCard meeting={meeting} teamId={teamId} menuActions={getMenuActions(meeting)} />
          </li>
        ))}
      </ul>
      <MeetingListLoadMore
        hasMore={hasMore}
        status={loadMoreStatus}
        onLoadMore={onLoadMore}
        scrollRootRef={scrollRootRef}
      />
    </>
  );
};
