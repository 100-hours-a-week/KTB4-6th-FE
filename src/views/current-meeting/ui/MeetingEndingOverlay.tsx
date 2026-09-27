import { LoaderCircle } from 'lucide-react';

/** 회의 종료 처리 중에 화면 위를 덮어 조작을 막는다. */
export const MeetingEndingOverlay = () => (
  <div
    role="status"
    aria-live="polite"
    className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/85 px-6 text-center"
  >
    <LoaderCircle
      aria-hidden="true"
      className="size-7 text-brand-600 motion-safe:animate-spin"
      strokeWidth={2}
    />
    <p className="mt-4 text-base font-bold text-cool-900">회의를 종료하고 있습니다</p>
    <p className="mt-3 text-sm text-cool-600">녹음과 녹취 내용을 저장하는 중이에요</p>
  </div>
);
