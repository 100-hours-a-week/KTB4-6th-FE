import { Clock } from 'lucide-react';

export const AudioUploadingNotice = () => (
  <div className="flex shrink-0 items-start gap-3 border-t border-cool-200 bg-white px-5 py-4">
    <Clock aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-cool-500" strokeWidth={2} />
    <p className="text-sm leading-5 text-cool-500">
      녹음 파일을 업로드하고 있습니다. 잠시만 기다려 주세요.
    </p>
  </div>
);
