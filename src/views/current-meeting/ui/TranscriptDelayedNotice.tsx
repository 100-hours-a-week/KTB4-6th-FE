export const TranscriptDelayedNotice = () => (
  <div
    role="status"
    className="flex shrink-0 items-center gap-2.5 border-t border-amber-200 bg-amber-50 px-5 py-3 text-sm font-semibold text-amber-800"
  >
    <span
      aria-hidden="true"
      className="size-4 shrink-0 rounded-full border-2 border-amber-200 border-t-amber-600 motion-safe:animate-spin"
    />
    <p className="min-w-0 leading-5 [word-break:keep-all]">기록 지연 중 · 녹음은 계속 저장돼요</p>
  </div>
);
