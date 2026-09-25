import { Captions } from 'lucide-react';

export const TranscriptEmptyState = () => (
  <div className="flex flex-1 flex-col items-center justify-center px-4 pb-24 text-center">
    <div
      aria-hidden="true"
      className="flex size-12 items-center justify-center rounded-2xl bg-cool-100 text-cool-400"
    >
      <Captions className="size-6" strokeWidth={1.8} />
    </div>
    <p className="mt-4 text-base font-bold text-cool-900">전사 내용이 없습니다</p>
    <p className="mt-2 text-[13px] text-cool-500">
      회의 중 인식된 발화가 없어 전사가 생성되지 않았습니다.
    </p>
  </div>
);
