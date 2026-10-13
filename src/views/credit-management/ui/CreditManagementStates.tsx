import { CircleAlert, LoaderCircle, ReceiptText } from 'lucide-react';

export const CreditBalanceLoadingState = () => (
  <div
    role="status"
    aria-label="크레딧 보유량을 불러오는 중"
    className="rounded-2xl bg-brand-200 px-5 py-6 motion-safe:animate-pulse"
  >
    <div className="h-5 w-20 rounded-md bg-white/50" />
    <div className="mt-7 h-10 w-36 rounded-lg bg-white/70" />
    <div className="mt-7 h-1.5 rounded-full bg-white/50" />
    <div className="mt-2.5 h-5 w-52 rounded-md bg-white/40" />
  </div>
);

interface RetryStateProps {
  isRetrying: boolean;
  onRetry: () => void;
}

const RetryButton = ({ isRetrying, onRetry }: RetryStateProps) => (
  <button
    type="button"
    disabled={isRetrying}
    onClick={onRetry}
    className="mt-4 inline-flex min-w-24 items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-cool-200 disabled:text-cool-400"
  >
    {isRetrying && <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />}
    {isRetrying ? '불러오는 중' : '다시 시도'}
  </button>
);

export const CreditBalanceErrorState = ({ isRetrying, onRetry }: RetryStateProps) => (
  <div
    role="alert"
    className="flex min-h-52 flex-col items-center justify-center rounded-2xl bg-white px-5 py-8 text-center"
  >
    <span className="flex size-14 items-center justify-center rounded-full bg-danger-bg text-danger">
      <CircleAlert aria-hidden="true" className="size-6" strokeWidth={1.75} />
    </span>
    <h2 className="mt-4 text-[17px] font-bold tracking-tight text-cool-900">
      크레딧 보유량을 불러오지 못했어요
    </h2>
    <p className="mt-1.5 text-sm leading-6 text-cool-600">잠시 후 다시 시도해주세요.</p>
    <RetryButton isRetrying={isRetrying} onRetry={onRetry} />
  </div>
);

export const CreditLedgerLoadingState = () => (
  <div role="status" aria-label="크레딧 내역을 불러오는 중" className="motion-safe:animate-pulse">
    {[0, 1, 2].map((index) => (
      <div
        key={index}
        aria-hidden="true"
        className="flex items-center justify-between gap-4 border-b border-cool-200 px-5 py-4"
      >
        <div>
          <div className="h-5 w-28 rounded-md bg-cool-200" />
          <div className="mt-1.5 h-4 w-36 rounded-md bg-cool-100" />
        </div>
        <div className="flex flex-col items-end">
          <div className="h-5 w-14 rounded-md bg-cool-200" />
          <div className="mt-1.5 h-4 w-20 rounded-md bg-cool-100" />
        </div>
      </div>
    ))}
  </div>
);

export const CreditLedgerEmptyState = () => (
  <div className="flex min-h-72 flex-col items-center justify-center px-5 py-16 text-center">
    <span className="flex size-17 items-center justify-center rounded-full bg-brand-100 text-brand-600">
      <ReceiptText aria-hidden="true" className="size-7" strokeWidth={1.75} />
    </span>
    <h2 className="mt-4 text-[17px] font-bold tracking-tight text-cool-900">
      크레딧 내역이 없어요
    </h2>
    <p className="mt-1.5 text-sm leading-6 text-cool-600">
      크레딧이 적립되거나 사용되면 이곳에 표시됩니다.
    </p>
  </div>
);

export const CreditLedgerErrorState = ({ isRetrying, onRetry }: RetryStateProps) => (
  <div
    role="alert"
    className="flex min-h-72 flex-col items-center justify-center px-5 py-16 text-center"
  >
    <span className="flex size-17 items-center justify-center rounded-full bg-danger-bg text-danger">
      <CircleAlert aria-hidden="true" className="size-7" strokeWidth={1.75} />
    </span>
    <h2 className="mt-4 text-[17px] font-bold tracking-tight text-cool-900">
      크레딧 내역을 불러오지 못했어요
    </h2>
    <p className="mt-1.5 text-sm leading-6 text-cool-600">잠시 후 다시 시도해주세요.</p>
    <RetryButton isRetrying={isRetrying} onRetry={onRetry} />
  </div>
);
