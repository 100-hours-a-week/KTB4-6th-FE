import { CircleAlert, LoaderCircle } from 'lucide-react';

export const AttendeeMembersLoadingState = () => (
  <div role="status" aria-label="팀원 목록을 불러오는 중" className="motion-safe:animate-pulse">
    <div className="h-4 w-14 rounded-md bg-cool-100" />
    <ul aria-hidden="true" className="mt-3 grid grid-cols-4 gap-x-2 gap-y-3">
      {Array.from({ length: 8 }, (_, index) => (
        <li key={index} className="flex flex-col items-center gap-1.5 py-1">
          <span className="size-12 rounded-full bg-cool-100" />
          <span className="h-4 w-10 rounded-md bg-cool-100" />
        </li>
      ))}
    </ul>
  </div>
);

interface AttendeeMembersErrorStateProps {
  isRetrying: boolean;
  onRetry: () => void;
}

export const AttendeeMembersErrorState = ({
  isRetrying,
  onRetry,
}: AttendeeMembersErrorStateProps) => (
  <div role="alert" className="flex flex-col items-center py-6 text-center">
    <span className="flex size-12 items-center justify-center rounded-full bg-danger-bg text-danger">
      <CircleAlert aria-hidden="true" className="size-5" strokeWidth={1.75} />
    </span>
    <p className="mt-3 text-[15px] font-bold text-cool-900">팀원 목록을 불러오지 못했어요</p>
    <p className="mt-1 text-sm text-cool-600">잠시 후 다시 시도해주세요.</p>
    <button
      type="button"
      disabled={isRetrying}
      onClick={onRetry}
      className="mt-4 inline-flex min-w-24 items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-cool-200 disabled:text-cool-400"
    >
      {isRetrying && <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />}
      {isRetrying ? '불러오는 중' : '다시 시도'}
    </button>
  </div>
);
