interface AssistantChatHistoryStateProps {
  status: 'loading' | 'error';
  onRetry: () => void;
}

export const AssistantChatHistoryState = ({ status, onRetry }: AssistantChatHistoryStateProps) =>
  status === 'loading' ? (
    <div role="status" className="flex flex-1 flex-col items-center justify-center gap-3">
      <span
        aria-hidden="true"
        className="size-6 rounded-full border-2 border-cool-200 border-t-brand-600 motion-safe:animate-spin"
      />
      <p className="text-[13px] text-cool-500">이전 대화를 불러오고 있어요</p>
    </div>
  ) : (
    <div
      role="alert"
      className="flex flex-1 flex-col items-center justify-center gap-1.5 text-center"
    >
      <p className="text-[15px] font-semibold text-cool-900">이전 대화를 불러오지 못했어요</p>
      <p className="text-[13px] text-cool-500">잠시 후 다시 시도해 주세요.</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-3 min-h-10 rounded-[10px] border border-cool-200 bg-white px-5 text-[13px] font-semibold text-cool-700 transition-colors hover:bg-cool-50"
      >
        다시 시도
      </button>
    </div>
  );
