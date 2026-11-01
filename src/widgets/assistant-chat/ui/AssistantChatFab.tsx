import Image from 'next/image';

interface AssistantChatFabProps {
  isHintVisible: boolean;
  onOpen: () => void;
}

export const AssistantChatFab = ({ isHintVisible, onOpen }: AssistantChatFabProps) => (
  <div className="absolute right-[18px] bottom-[26px] z-50 flex items-end gap-2">
    {isHintVisible && (
      <button
        type="button"
        onClick={onOpen}
        className="mb-6 rounded-[14px_14px_4px_14px] border border-cool-200 bg-white px-[13px] py-2.5 text-[12.5px] leading-[1.3] font-semibold tracking-[-0.01em] whitespace-nowrap text-cool-900 shadow-[0_8px_20px_rgba(22,30,43,0.12)] motion-safe:animate-in motion-safe:fade-in motion-safe:zoom-in-95 motion-safe:duration-200"
      >
        무엇이든 물어보세요!
      </button>
    )}
    <button
      type="button"
      aria-label="미티 채팅 열기"
      onClick={onOpen}
      className="-mr-2.5 -mb-2.5 size-[92px] shrink-0 transition-transform active:scale-95"
    >
      <Image
        src="/brand/mascot/meety-12-chat-bubble-transparent.png"
        alt=""
        width={92}
        height={92}
        className="size-[92px] drop-shadow-[0_6px_12px_rgba(22,30,43,0.16)]"
      />
    </button>
  </div>
);
