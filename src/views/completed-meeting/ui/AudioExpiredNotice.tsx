import { Clock } from 'lucide-react';

export const AudioExpiredNotice = () => (
  <div className="flex shrink-0 items-start gap-3 border-t border-cool-200 bg-white px-5 py-4">
    <Clock aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-cool-500" strokeWidth={2} />
    <p className="text-sm leading-5 text-cool-500">
      음성 파일이 만료되어 재생할 수 없습니다. 전사와 요약은 그대로 유지됩니다.
    </p>
  </div>
);
