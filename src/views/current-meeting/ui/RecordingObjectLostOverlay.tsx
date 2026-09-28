interface RecordingObjectLostOverlayProps {
  secondsLeft: number;
}

/** 녹음이 끊겨 더 이상 이어갈 수 없을 때, 자동 종료까지 남은 시간을 보여주며 화면을 막는다. */
export const RecordingObjectLostOverlay = ({ secondsLeft }: RecordingObjectLostOverlayProps) => (
  <div
    role="alertdialog"
    aria-live="assertive"
    className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/85 px-6 text-center"
  >
    <div className="flex size-14 items-center justify-center rounded-full bg-danger-bg text-lg font-bold text-danger tabular-nums">
      {secondsLeft}
    </div>
    <p className="mt-4 text-base font-bold text-cool-900">녹음이 끊겨 더 이상 이어갈 수 없습니다</p>
    <p className="mt-3 text-sm text-cool-600">잠시 후 회의를 자동으로 종료합니다</p>
  </div>
);
