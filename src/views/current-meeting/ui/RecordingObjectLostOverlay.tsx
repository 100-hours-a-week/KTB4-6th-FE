/** 녹음이 끊겨 재연결을 시도하는 동안 화면을 막고 안내한다. 복구되거나, 실패해 회의가 종료되면 사라진다. */
export const RecordingObjectLostOverlay = () => (
  <div
    role="alertdialog"
    aria-live="assertive"
    className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/85 px-6 text-center"
  >
    <div className="size-14 animate-spin rounded-full border-4 border-cool-200 border-t-danger" />
    <p className="mt-4 text-base font-bold text-cool-900">
      녹음이 끊겨 다시 연결을 시도하고 있습니다
    </p>
    <p className="mt-3 text-sm text-cool-600">계속 실패하면 회의가 자동으로 종료됩니다</p>
  </div>
);
