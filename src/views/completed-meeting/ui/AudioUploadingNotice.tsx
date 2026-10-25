import { Clock } from 'lucide-react';

export const AudioUploadingNotice = () => (
  <div
    role="status"
    className="flex shrink-0 items-center gap-3 border-t border-cool-200 bg-white px-5 py-4"
  >
    <span aria-hidden="true" className="relative grid size-6 shrink-0 place-items-center">
      <span className="absolute inset-0 rounded-full border-2 border-cool-200 border-t-brand-600 motion-safe:animate-spin" />
      <Clock className="size-3.5 text-cool-500" strokeWidth={2.2} />
    </span>
    <p className="text-sm leading-5 text-cool-500">
      녹음 파일을 업로드하고 있습니다. 잠시만 기다려 주세요.
    </p>
  </div>
);
