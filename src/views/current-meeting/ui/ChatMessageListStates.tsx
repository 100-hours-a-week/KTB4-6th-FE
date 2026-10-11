import { CircleAlert, LoaderCircle, MessageCircle } from 'lucide-react';

export const ChatListLoadingState = () => (
  <div role="status" aria-label="채팅을 불러오는 중입니다" className="flex flex-col gap-7 py-2">
    {[0, 1].map((index) => (
      <div key={index} className="flex animate-pulse items-start gap-3">
        <span className="size-10 shrink-0 rounded-full bg-cool-200" />
        <div className="flex flex-1 flex-col gap-2 pt-1">
          <span className="h-3 w-24 rounded-full bg-cool-200" />
          <span className="h-18 rounded-2xl bg-cool-100" />
        </div>
      </div>
    ))}
  </div>
);

export const ChatListEmptyState = () => (
  <div className="flex flex-1 flex-col items-center justify-center px-5 pb-16 text-center">
    <span className="flex size-17 items-center justify-center rounded-full bg-brand-100 text-brand-600">
      <MessageCircle aria-hidden="true" className="size-7" strokeWidth={1.75} />
    </span>
    <h2 className="mt-4 text-[17px] font-bold tracking-tight text-cool-900">아직 질문이 없어요</h2>
    <p className="mt-1.5 text-sm leading-6 text-cool-600">
      회의 내용이 궁금할 때 Meety에게 질문해보세요
    </p>
  </div>
);

interface ChatListErrorStateProps {
  isRetrying: boolean;
  onRetry: () => void;
}

export const ChatListErrorState = ({ isRetrying, onRetry }: ChatListErrorStateProps) => (
  <div
    className="flex flex-1 flex-col items-center justify-center px-5 pb-16 text-center"
    role="alert"
  >
    <span className="flex size-17 items-center justify-center rounded-full bg-danger-bg text-danger">
      <CircleAlert aria-hidden="true" className="size-7" strokeWidth={1.75} />
    </span>
    <h2 className="mt-4 text-[17px] font-bold tracking-tight text-cool-900">
      채팅을 불러오지 못했어요
    </h2>
    <p className="mt-1.5 text-sm leading-6 text-cool-600">잠시 후 다시 시도해주세요.</p>
    <button
      type="button"
      disabled={isRetrying}
      onClick={onRetry}
      className="mt-4 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-cool-200 disabled:text-cool-400"
    >
      {isRetrying ? '불러오는 중' : '다시 시도'}
    </button>
  </div>
);

export const ChatHistoryLoadingState = () => (
  <div role="status" className="flex items-center justify-center gap-2 py-3 text-xs text-cool-500">
    <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
    이전 채팅을 불러오고 있어요
  </div>
);

interface ChatHistoryErrorStateProps {
  onRetry: () => void;
}

export const ChatHistoryErrorState = ({ onRetry }: ChatHistoryErrorStateProps) => (
  <div role="alert" className="flex items-center justify-center gap-2 py-3 text-xs text-danger">
    <span>이전 채팅을 불러오지 못했어요.</span>
    <button type="button" onClick={onRetry} className="font-semibold underline underline-offset-2">
      다시 시도
    </button>
  </div>
);
