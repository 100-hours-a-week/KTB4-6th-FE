import Image from 'next/image';
import { cn } from '@/shared/lib';

interface AssistantChatAvatarProps {
  className?: string;
}

export const AssistantChatAvatar = ({ className }: AssistantChatAvatarProps) => (
  <span
    aria-hidden="true"
    className={cn('shrink-0 overflow-hidden rounded-full bg-brand-100', className)}
  >
    <Image
      src="/brand/mascot/meety-05-glasses.png"
      alt=""
      width={40}
      height={40}
      className="size-full object-contain"
    />
  </span>
);
