import { TriangleAlert } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/shared/lib';

interface VoiceEnrollQualityBannerProps {
  message: string | null;
  hasCloseButton: boolean;
}

export const VoiceEnrollQualityBanner = ({
  message,
  hasCloseButton,
}: VoiceEnrollQualityBannerProps) => {
  const [shownMessage, setShownMessage] = useState(message);
  if (message && message !== shownMessage) setShownMessage(message);

  return (
    <div
      role="status"
      aria-hidden={!message}
      className={cn(
        'absolute inset-x-0 top-0 z-[5] transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]',
        message ? 'translate-y-0' : '-translate-y-[calc(100%+64px)]',
      )}
    >
      <div
        className={cn(
          'flex items-center gap-3 rounded-xl border border-warning/25 bg-warning-bg px-4 py-3.5 shadow-[0_10px_22px_rgba(154,98,18,0.18)]',
          hasCloseButton && 'pr-10',
        )}
      >
        <TriangleAlert aria-hidden="true" className="size-6 shrink-0 text-warning" />
        <div className="flex min-w-0 flex-col gap-1">
          <span className="text-[15px] leading-[1.4] font-bold break-keep text-warning">
            {shownMessage}
          </span>
          <span className="text-[13px] leading-[1.5] break-keep text-warning/80">
            이대로 녹음하면 내 발언을 구분하는
            <br />
            정확도가 떨어질 수 있어요.
          </span>
        </div>
      </div>
    </div>
  );
};
