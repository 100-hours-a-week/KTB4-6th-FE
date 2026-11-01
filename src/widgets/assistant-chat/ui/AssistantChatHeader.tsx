import { Drawer } from '@base-ui/react/drawer';
import { ChevronDown } from 'lucide-react';
import { AssistantChatAvatar } from './AssistantChatAvatar';

interface AssistantChatHeaderProps {
  onHelpClick: () => void;
}

export const AssistantChatHeader = ({ onHelpClick }: AssistantChatHeaderProps) => (
  <header className="flex shrink-0 items-center gap-2.5 border-b border-cool-200 bg-white px-3 py-2">
    <Drawer.Close
      aria-label="미티 채팅 닫기"
      className="flex size-11 shrink-0 items-center justify-center rounded-lg text-cool-900 transition-colors hover:bg-cool-50"
    >
      <ChevronDown className="size-5" strokeWidth={1.8} />
    </Drawer.Close>

    <div className="flex min-w-0 flex-1 items-center gap-[9px]">
      <AssistantChatAvatar className="size-[34px]" />
      <div className="flex min-w-0 flex-col gap-1">
        <Drawer.Title className="text-[15px] leading-none font-semibold tracking-[-0.02em] text-cool-900">
          미티
        </Drawer.Title>
        <Drawer.Description className="text-[11px] leading-none text-cool-500">
          나만의 회의 비서
        </Drawer.Description>
      </div>
    </div>

    <button
      type="button"
      aria-label="물어볼 수 있는 질문 보기"
      onClick={onHelpClick}
      className="flex size-11 shrink-0 items-center justify-center rounded-lg transition-colors hover:bg-cool-50"
    >
      <span
        aria-hidden="true"
        className="flex size-[26px] items-center justify-center rounded-full border-[1.6px] border-cool-600 text-[13.5px] leading-none font-bold text-cool-600"
      >
        ?
      </span>
    </button>
  </header>
);
