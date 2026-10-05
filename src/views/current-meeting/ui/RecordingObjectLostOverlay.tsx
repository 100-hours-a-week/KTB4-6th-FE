import { cn } from '@/shared/lib';

interface RecordingObjectLostOverlayProps {
  /** 재연결은 됐고, 끊긴 동안의 녹음을 보내며 새 녹음을 준비하는 중인지 */
  isResuming: boolean;
}

/** 녹음이 끊겨 복구하는 동안 화면을 막고 안내한다. 복구되거나, 실패해 회의가 종료되면 사라진다. */
export const RecordingObjectLostOverlay = ({ isResuming }: RecordingObjectLostOverlayProps) => (
  <div
    role="alertdialog"
    aria-live="assertive"
    className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/85 px-6 text-center"
  >
    <div
      className={cn(
        'size-14 animate-spin rounded-full border-4 border-cool-200',
        isResuming ? 'border-t-brand-600' : 'border-t-danger',
      )}
    />
    <p className="mt-4 text-base font-bold text-cool-900">
      {isResuming ? '녹음을 다시 이어가고 있습니다' : '녹음이 끊겨 다시 연결을 시도하고 있습니다'}
    </p>
    <p className="mt-3 text-sm text-cool-600">
      {isResuming
        ? '끊긴 동안의 녹음을 보내는 중입니다. 잠시만 기다려 주세요'
        : '계속 실패하면 회의가 자동으로 종료됩니다'}
    </p>
  </div>
);
