'use client';

import { useRef } from 'react';
import { Popover } from '@base-ui/react/popover';
import { Info, X } from 'lucide-react';
import {
  CHAT_CREDIT_COST,
  RECORDING_CREDIT_COST,
  SUMMARY_REGENERATE_CREDIT_COST,
  WEEKLY_CREDIT_GRANT_AMOUNT,
} from '@/features/credit-management';
import { useAppFrameElement } from '@/shared/lib';

interface CreditPolicyPopoverProps {
  maxBalance: number;
}

const formatCredits = (credits: number) => `${credits.toLocaleString('ko-KR')} 크레딧`;

export const CreditPolicyPopover = ({ maxBalance }: CreditPolicyPopoverProps) => {
  const frame = useAppFrameElement();
  const triggerRef = useRef<HTMLButtonElement>(null);

  return (
    <Popover.Root>
      <Popover.Trigger
        ref={triggerRef}
        aria-label="크레딧 정책 안내"
        className="flex size-8 items-center justify-center rounded-lg text-brand-200 transition-colors hover:bg-brand-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 data-[popup-open]:bg-brand-500 data-[popup-open]:text-white"
      >
        <Info aria-hidden="true" className="size-[15px]" strokeWidth={2} />
      </Popover.Trigger>

      <Popover.Portal container={frame}>
        <Popover.Positioner
          className="z-[75] outline-none"
          side="bottom"
          align="start"
          sideOffset={6}
          alignOffset={({ positioner }) => {
            const frameRect = frame?.getBoundingClientRect();
            const triggerRect = triggerRef.current?.getBoundingClientRect();

            if (!frameRect || !triggerRect) return 0;

            const centeredLeft = frameRect.left + (frameRect.width - positioner.width) / 2;

            return centeredLeft - triggerRect.left;
          }}
          collisionBoundary={frame ?? undefined}
          collisionPadding={20}
        >
          <Popover.Popup className="w-[322px] max-w-[calc(100vw-2.5rem)] rounded-xl bg-cool-900 px-4 py-3.5 text-left shadow-[0_12px_28px_rgba(22,30,43,0.22)] outline-none">
            <Popover.Arrow className="size-3 rotate-45 rounded-[2px] bg-cool-900 data-[side=bottom]:-top-1.5 data-[side=left]:-right-1.5 data-[side=right]:-left-1.5 data-[side=top]:-bottom-1.5" />

            <div className="flex items-center justify-between gap-2">
              <Popover.Title className="text-[13px] font-semibold text-white">
                크레딧 정책
              </Popover.Title>
              <Popover.Close
                aria-label="크레딧 정책 안내 닫기"
                className="-mr-2 flex size-7 items-center justify-center rounded-md text-cool-300 transition-colors hover:bg-cool-800 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
              >
                <X aria-hidden="true" className="size-3" strokeWidth={2} />
              </Popover.Close>
            </div>

            <div className="mt-2">
              <div className="flex items-center justify-between gap-3 border-b border-cool-700 py-2.5 text-[13px]">
                <span className="text-cool-300">주간 적립</span>
                <span className="text-right font-semibold text-white">
                  매주 월요일 00:00에 {formatCredits(WEEKLY_CREDIT_GRANT_AMOUNT)}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3 border-b border-cool-700 py-2.5 text-[13px]">
                <span className="text-cool-300">최대 보유</span>
                <span className="font-semibold text-white">{formatCredits(maxBalance)}</span>
              </div>
            </div>

            <div className="pt-2.5">
              <p className="text-[13px] text-cool-300">사용 시 차감</p>
              <dl className="mt-2 space-y-2 text-[13px] text-white">
                <div className="flex items-center justify-between gap-3">
                  <dt>회의 진행</dt>
                  <dd className="font-semibold">{formatCredits(RECORDING_CREDIT_COST)}</dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt>AI 요약 재생성</dt>
                  <dd className="font-semibold">{formatCredits(SUMMARY_REGENERATE_CREDIT_COST)}</dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt>AI 채팅 질의응답</dt>
                  <dd className="font-semibold">{formatCredits(CHAT_CREDIT_COST)}</dd>
                </div>
              </dl>
            </div>

            <Popover.Description className="mt-4 text-xs leading-5 text-cool-300">
              {maxBalance.toLocaleString('ko-KR')} 크레딧을 넘는 만큼은 적립되지 않아요.
            </Popover.Description>
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
};
