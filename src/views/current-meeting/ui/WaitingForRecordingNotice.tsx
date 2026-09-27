import { Headphones } from 'lucide-react';

/** 아직 녹음을 시작하지 않은 회의에서 전사 대신 보여주는 안내. */
export const WaitingForRecordingNotice = () => (
  <main className="flex flex-1 flex-col items-center justify-center px-6 py-10 text-center">
    <div className="flex size-16 items-center justify-center rounded-2xl bg-brand-100 text-brand-600">
      <Headphones aria-hidden="true" className="size-7" strokeWidth={2.2} />
    </div>
    <p className="mt-5 text-base font-bold text-cool-900">녹음 시작을 눌러 회의를 기록해주세요</p>
    <p className="mt-4 text-sm leading-6 text-cool-600">
      참여자 누구나 녹음을 시작할 수 있어요.
      <br />
      시작한 사람이 일시정지와 종료를 관리합니다.
    </p>
  </main>
);
