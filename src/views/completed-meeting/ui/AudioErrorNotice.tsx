import { CircleAlert } from 'lucide-react';

interface AudioErrorNoticeProps {
  onRetry: () => void;
}

/** 음성 파일 정보나 재생 주소를 받지 못해 재생할 수 없을 때 플레이어 자리에 보여준다. */
export const AudioErrorNotice = ({ onRetry }: AudioErrorNoticeProps) => (
  <div
    role="alert"
    className="flex shrink-0 items-center gap-3 border-t border-cool-200 bg-white px-5 py-4"
  >
    <CircleAlert aria-hidden="true" className="size-5 shrink-0 text-danger" strokeWidth={2} />
    <p className="min-w-0 flex-1 text-sm leading-5 text-cool-600">
      음성을 불러오지 못했습니다. 전사와 요약은 그대로 볼 수 있습니다.
    </p>
    <button
      type="button"
      onClick={onRetry}
      className="h-9 shrink-0 rounded-lg bg-brand-600 px-3 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
    >
      다시 시도
    </button>
  </div>
);
