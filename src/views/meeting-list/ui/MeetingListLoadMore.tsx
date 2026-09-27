import type { MeetingListLoadMoreStatus } from '../model/type';

interface MeetingListLoadMoreProps {
  status: MeetingListLoadMoreStatus;
  onClick: () => void;
}

const BUTTON_CLASS_NAME =
  'flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-cool-200 text-sm font-medium text-cool-600 transition-colors hover:bg-cool-50 disabled:cursor-default disabled:hover:bg-transparent';

/** 목록 아래의 더보기 영역. 불러오는 중과 실패 상태를 함께 표현한다. 더 불러올 회의가 없으면 부모가 그리지 않는다. */
export const MeetingListLoadMore = ({ status, onClick }: MeetingListLoadMoreProps) => {
  if (status === 'loading') {
    return (
      <div className="mt-4">
        <button type="button" disabled aria-busy="true" className={BUTTON_CLASS_NAME}>
          <span
            aria-hidden="true"
            className="size-4 shrink-0 rounded-full border-2 border-cool-200 border-t-brand-600 motion-safe:animate-spin"
          />
          불러오는 중
        </button>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="mt-4 flex flex-col gap-2">
        <p role="alert" className="text-center text-xs text-danger">
          회의를 더 불러오지 못했어요
        </p>
        <button type="button" onClick={onClick} className={BUTTON_CLASS_NAME}>
          다시 시도
        </button>
      </div>
    );
  }

  return (
    <div className="mt-4">
      <button type="button" onClick={onClick} className={BUTTON_CLASS_NAME}>
        더보기
      </button>
    </div>
  );
};
