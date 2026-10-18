import { CircleAlert, LoaderCircle } from 'lucide-react';
import { cn } from '@/shared/lib';

const CARD_CLASS_NAME = 'rounded-[20px] bg-white shadow-[0_2px_12px_rgba(31,53,85,0.07)]';
const TOPIC_ROW_COUNT = 5;

export const DashboardLoadingState = () => (
  <div
    role="status"
    aria-label="대시보드를 불러오는 중"
    className="flex flex-col gap-2.5 motion-safe:animate-pulse"
  >
    <div aria-hidden="true" className={cn(CARD_CLASS_NAME, 'overflow-hidden')}>
      <div className="flex flex-col gap-2.5 bg-brand-200 px-5 py-4">
        <div className="h-4 w-20 rounded-md bg-white/50" />
        <div className="h-8 w-32 rounded-lg bg-white/70" />
      </div>
      <div className="flex flex-col gap-3.5 px-4 pt-4 pb-3.5">
        <div className="h-5 w-36 rounded-md bg-cool-200" />
        <div className="h-10 rounded-[11px] bg-cool-100" />
        <div className="h-[260px] rounded-[10px] bg-cool-100" />
      </div>
    </div>

    <div aria-hidden="true" className={cn(CARD_CLASS_NAME, 'grid grid-cols-2')}>
      {Array.from({ length: 2 }, (_, index) => (
        <div
          key={index}
          className={cn(
            'flex flex-col gap-3 px-[18px] py-4',
            index === 1 && 'border-l border-cool-100',
          )}
        >
          <div className="h-4 w-24 rounded-md bg-cool-200" />
          <div className="h-6 w-16 rounded-md bg-cool-200" />
          {index === 1 && <div className="h-1.5 rounded-full bg-cool-100" />}
        </div>
      ))}
      <div className="col-span-2 mx-[18px] flex items-center justify-between border-t border-cool-100 py-4">
        <div className="flex flex-col gap-3">
          <div className="h-4 w-32 rounded-md bg-cool-200" />
          <div className="h-6 w-20 rounded-md bg-cool-200" />
          <div className="h-3 w-36 rounded-md bg-cool-100" />
        </div>
        <div className="size-[58px] rounded-full border-[7px] border-cool-100" />
      </div>
    </div>

    <div aria-hidden="true" className={cn(CARD_CLASS_NAME, 'flex flex-col px-4 pt-4 pb-2')}>
      <div className="mb-3 h-5 w-40 rounded-md bg-cool-200" />
      {Array.from({ length: TOPIC_ROW_COUNT }, (_, index) => (
        <div
          key={index}
          className={cn('flex flex-col gap-2 pt-2.5 pb-3', index > 0 && 'border-t border-cool-100')}
        >
          <div className="flex items-center gap-2.5">
            <div className="size-6 shrink-0 rounded-full bg-cool-200" />
            <div className="h-4 flex-1 rounded-md bg-cool-200" />
            <div className="h-4 w-12 rounded-md bg-cool-200" />
          </div>
          <div className="ml-[34px] h-1.5 rounded-[3px] bg-cool-100" />
        </div>
      ))}
    </div>
  </div>
);

interface DashboardErrorStateProps {
  isRetrying: boolean;
  onRetry: () => void;
}

export const DashboardErrorState = ({ isRetrying, onRetry }: DashboardErrorStateProps) => (
  <div
    role="alert"
    className={cn(
      CARD_CLASS_NAME,
      'flex min-h-72 flex-col items-center justify-center px-5 py-10 text-center',
    )}
  >
    <span className="flex size-14 items-center justify-center rounded-full bg-danger-bg text-danger">
      <CircleAlert aria-hidden="true" className="size-6" strokeWidth={1.75} />
    </span>
    <h2 className="mt-4 text-[17px] font-bold tracking-tight text-cool-900">
      대시보드를 불러오지 못했어요
    </h2>
    <p className="mt-1.5 text-sm leading-6 text-cool-600">잠시 후 다시 시도해주세요.</p>
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
