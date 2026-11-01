'use client';

import Image from 'next/image';
import { Drawer } from '@base-ui/react/drawer';
import { CalendarPlus, ChartNoAxesColumn, ChevronRight, Search, X } from 'lucide-react';
import { cn, useAppFrameElement } from '@/shared/lib';

const EXAMPLE_QUESTIONS = [
  {
    question: '회의를 생성해줘',
    description: '이름·시간·참여자를 대신 채워드려요',
    Icon: CalendarPlus,
    tileClassName: 'bg-brand-100 text-brand-600',
  },
  {
    question: '회의를 분석해줘',
    description: '시간, 핵심 결정, 할 일을 정리해요',
    Icon: ChartNoAxesColumn,
    tileClassName: 'bg-warning-bg text-warning',
  },
  {
    question: '과거 회의를 찾아서 알려줘',
    description: '키워드나 날짜로 지난 회의를 찾아요',
    Icon: Search,
    tileClassName: 'bg-success-bg text-success',
  },
];

interface AssistantChatHelpSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onPickQuestion: (question: string) => void;
}

export const AssistantChatHelpSheet = ({
  isOpen,
  onOpenChange,
  onPickQuestion,
}: AssistantChatHelpSheetProps) => {
  const frame = useAppFrameElement();

  return (
    <Drawer.Root open={isOpen} onOpenChange={onOpenChange} swipeDirection="down">
      <Drawer.Portal container={frame}>
        <Drawer.Backdrop
          forceRender
          className="absolute inset-0 z-[70] bg-cool-900/40 transition-opacity duration-200 data-ending-style:opacity-0 data-starting-style:opacity-0"
        />

        <Drawer.Viewport className="absolute inset-0 z-[70] flex items-end">
          <Drawer.Popup className="flex w-full flex-col gap-2.5 rounded-t-[22px] bg-white px-5 pt-2.5 pb-[30px] shadow-[0_-8px_28px_rgba(22,30,43,0.14)] outline-none transition-transform duration-[280ms] ease-[cubic-bezier(0.22,1,0.36,1)] [transform:translateY(var(--drawer-swipe-movement-y))] data-ending-style:translate-y-full data-starting-style:translate-y-full">
            <span
              aria-hidden="true"
              className="mx-auto h-1 w-9 shrink-0 rounded-full bg-cool-300"
            />

            <div className="flex items-center gap-2.5 pt-2 pb-1.5">
              <Image
                src="/brand/mascot/meety-11-glasses-pointing-transparent.png"
                alt=""
                width={216}
                height={216}
                className="size-[72px] shrink-0"
              />
              <div className="flex flex-1 flex-col gap-[5px]">
                <Drawer.Title className="text-[17px] leading-[1.3] font-bold tracking-[-0.03em] text-cool-900">
                  이런 질문을 할 수 있어요
                </Drawer.Title>
                <Drawer.Description className="text-[12.5px] leading-[1.4] text-cool-500">
                  누르면 입력창에 채워져요
                </Drawer.Description>
              </div>
              <Drawer.Close
                aria-label="질문 목록 닫기"
                className="-mr-2.5 flex size-11 shrink-0 items-center justify-center rounded-lg text-cool-600 transition-colors hover:bg-cool-50"
              >
                <X className="size-[15px]" strokeWidth={1.8} />
              </Drawer.Close>
            </div>

            {EXAMPLE_QUESTIONS.map(({ question, description, Icon, tileClassName }) => (
              <button
                key={question}
                type="button"
                onClick={() => onPickQuestion(question)}
                className="flex w-full items-center gap-[13px] rounded-[18px_18px_18px_6px] border border-cool-200 bg-white px-3.5 py-[13px] text-left transition-[background-color,border-color,transform] hover:border-brand-200 hover:bg-brand-50/40 active:scale-[0.985]"
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    'flex size-[42px] shrink-0 items-center justify-center rounded-[13px]',
                    tileClassName,
                  )}
                >
                  <Icon className="size-5" strokeWidth={1.8} />
                </span>
                <span className="flex min-w-0 flex-1 flex-col gap-[5px]">
                  <span className="text-[15px] leading-[1.3] font-semibold tracking-[-0.02em] text-cool-900">
                    {question}
                  </span>
                  <span className="text-xs leading-[1.4] text-cool-500">{description}</span>
                </span>
                <ChevronRight
                  aria-hidden="true"
                  className="size-4 shrink-0 text-cool-400"
                  strokeWidth={1.8}
                />
              </button>
            ))}
          </Drawer.Popup>
        </Drawer.Viewport>
      </Drawer.Portal>
    </Drawer.Root>
  );
};
