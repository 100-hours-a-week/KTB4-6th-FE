import { CircleAlert, LoaderCircle, ReceiptText } from 'lucide-react';

export const CreditManagementLoadingState = () => (
  <div role="status" aria-label="크레딧 정보를 불러오는 중" className="motion-safe:animate-pulse">
    <div className="border-b border-cool-200 p-5">
      <div className="rounded-2xl bg-brand-200 px-5 py-6">
        <div className="h-5 w-20 rounded-md bg-white/50" />
        <div className="mt-7 h-10 w-36 rounded-lg bg-white/70" />
        <div className="mt-7 h-1.5 rounded-full bg-white/50" />
        <div className="mt-2.5 h-5 w-52 rounded-md bg-white/40" />
      </div>
    </div>

    <div className="flex flex-col items-center px-5 py-16">
      <div className="size-17 rounded-full bg-cool-200" />
      <div className="mt-4 h-6 w-24 rounded-md bg-cool-200" />
      <div className="mt-2 h-5 w-56 rounded-md bg-cool-200" />
    </div>
  </div>
);

interface CreditManagementErrorStateProps {
  isRetrying: boolean;
  onRetry: () => void;
}

export const CreditManagementErrorState = ({
  isRetrying,
  onRetry,
}: CreditManagementErrorStateProps) => (
  <div
    role="alert"
    className="flex flex-1 flex-col items-center justify-center px-5 pb-16 text-center"
  >
    <span className="flex size-17 items-center justify-center rounded-full bg-danger-bg text-danger">
      <CircleAlert aria-hidden="true" className="size-7" strokeWidth={1.75} />
    </span>
    <h2 className="mt-4 text-[17px] font-bold tracking-tight text-cool-900">
      크레딧 정보를 불러오지 못했어요
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

export const CreditHistoryPreparingState = () => (
  <div className="flex flex-1 flex-col items-center justify-center px-5 py-16 text-center">
    <span className="flex size-17 items-center justify-center rounded-full bg-brand-100 text-brand-600">
      <ReceiptText aria-hidden="true" className="size-7" strokeWidth={1.75} />
    </span>
    <h2 className="mt-4 text-[17px] font-bold tracking-tight text-cool-900">준비 중이에요</h2>
    <p className="mt-1.5 text-sm leading-6 text-cool-600">
      크레딧 내역은 곧 이곳에서 확인할 수 있어요
    </p>
  </div>
);
