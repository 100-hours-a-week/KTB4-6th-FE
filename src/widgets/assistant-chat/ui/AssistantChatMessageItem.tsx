import { cn } from '@/shared/lib';
import { ChatMarkdown } from '@/shared/markdown';
import type { AssistantChatMessage } from '../model/types';
import { AssistantChatAvatar } from './AssistantChatAvatar';

const MESSAGE_ENTER_CLASS_NAME =
  'motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-1.5 motion-safe:duration-200';

const TypingIndicator = () => (
  <div
    role="status"
    aria-label="미티가 답변을 준비하고 있어요"
    className="flex gap-[5px] rounded-[5px_18px_18px_18px] border border-cool-200 bg-white px-4 py-3.5"
  >
    {[0, 1, 2].map((index) => (
      <span
        key={index}
        aria-hidden="true"
        className="size-1.5 rounded-full bg-brand-500 motion-safe:animate-meety-typing"
        style={{ animationDelay: `${index * 150}ms` }}
      />
    ))}
  </div>
);

const UserMessage = ({ text }: { text: string }) => (
  <li className={cn('flex justify-end', MESSAGE_ENTER_CLASS_NAME)}>
    <p className="max-w-[78%] rounded-[18px_18px_5px_18px] bg-brand-600 px-3.5 py-[11px] text-sm leading-[1.55] font-medium tracking-[-0.01em] break-keep text-white [overflow-wrap:anywhere]">
      {text}
    </p>
  </li>
);

const AssistantMessage = ({ text }: { text: string }) => (
  <li className={cn('flex items-start gap-[9px]', MESSAGE_ENTER_CLASS_NAME)}>
    <AssistantChatAvatar className="size-8" />
    <div className="flex min-w-0 flex-1 flex-col items-start gap-2">
      <span className="mt-0.5 text-[11.5px] leading-none font-semibold text-cool-500">미티</span>
      {text ? (
        <div className="max-w-[94%] rounded-[5px_18px_18px_18px] border border-cool-200 bg-white px-3.5 py-[11px] text-sm leading-[1.6] tracking-[-0.01em] break-keep text-cool-900 [overflow-wrap:anywhere]">
          <ChatMarkdown>{text}</ChatMarkdown>
        </div>
      ) : (
        <TypingIndicator />
      )}
    </div>
  </li>
);

export const AssistantChatMessageItem = ({ message }: { message: AssistantChatMessage }) =>
  message.role === 'user' ? (
    <UserMessage text={message.text} />
  ) : (
    <AssistantMessage text={message.text} />
  );
