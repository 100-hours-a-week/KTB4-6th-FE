import Image from 'next/image';
import type { MouseEvent } from 'react';
import { cn } from '@/shared/lib';
import type { AssistantChatFabDrag } from '../model/useAssistantChatFabDrag';

interface AssistantChatFabProps {
  isHintVisible: boolean;
  bottomOffset: number;
  drag: AssistantChatFabDrag;
  onOpen: () => void;
}

export const AssistantChatFab = ({
  isHintVisible,
  bottomOffset,
  drag,
  onOpen,
}: AssistantChatFabProps) => {
  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    if (event.detail !== 0 && drag.consumeDragClick()) {
      event.preventDefault();
      return;
    }
    onOpen();
  };

  return (
    <div
      className="absolute right-[13px] bottom-[21px] z-50 size-[81px]"
      style={
        drag.position
          ? { top: drag.position.y, left: drag.position.x, right: 'auto', bottom: 'auto' }
          : { transform: `translateY(-${bottomOffset}px)` }
      }
    >
      {isHintVisible && !drag.isDragging && (
        <button
          type="button"
          onClick={onOpen}
          className={cn(
            'absolute bottom-[29px] border border-cool-200 bg-white px-[13px] py-2.5 text-[12.5px] leading-[1.3] font-semibold tracking-[-0.01em] whitespace-nowrap text-cool-900 shadow-[0_8px_20px_rgba(22,30,43,0.12)] motion-safe:animate-in motion-safe:fade-in motion-safe:zoom-in-95 motion-safe:duration-200',
            drag.side === 'left'
              ? 'left-[calc(100%+8px)] rounded-[14px_14px_14px_4px]'
              : 'right-[calc(100%+8px)] rounded-[14px_14px_4px_14px]',
          )}
        >
          무엇이든 물어보세요!
        </button>
      )}
      <button
        type="button"
        aria-label="미티 채팅 열기"
        onClick={handleClick}
        onPointerDown={drag.handlePointerDown}
        onPointerMove={drag.handlePointerMove}
        onPointerUp={drag.handlePointerUp}
        onPointerCancel={drag.handlePointerCancel}
        onLostPointerCapture={drag.handleLostPointerCapture}
        className="size-[81px] touch-none select-none"
      >
        <Image
          src="/brand/mascot/meety-12-chat-button-transparent.png"
          alt=""
          width={81}
          height={81}
          draggable={false}
          className="size-[81px] drop-shadow-[0_6px_12px_rgba(22,30,43,0.16)]"
        />
      </button>
    </div>
  );
};
