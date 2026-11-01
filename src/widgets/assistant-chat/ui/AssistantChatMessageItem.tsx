import Link from 'next/link';
import { ChevronRight, RotateCw } from 'lucide-react';
import { cn } from '@/shared/lib';
import { ChatMarkdown } from '@/shared/markdown';
import type { AssistantChatMessage } from '../model/types';
import { AssistantChatAvatar } from './AssistantChatAvatar';
import { AssistantChatMeetingDraftActions } from './AssistantChatMeetingDraftActions';

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

const FailedAnswer = ({ onRetry }: { onRetry: () => void }) => (
  <div
    role="alert"
    className="flex max-w-[94%] flex-col items-start gap-2.5 rounded-[5px_18px_18px_18px] border border-danger/20 bg-danger-bg px-3.5 py-[11px]"
  >
    <div>
      <p className="text-sm font-semibold text-danger">답변을 만들지 못했어요</p>
      <p className="mt-1 text-xs leading-5 text-cool-600">잠시 후 다시 시도해 주세요.</p>
    </div>
    <button
      type="button"
      onClick={onRetry}
      className="flex min-h-8 items-center gap-1 rounded-full border border-cool-200 bg-white px-3 text-xs font-semibold text-cool-700 transition-colors hover:bg-cool-50"
    >
      <RotateCw className="size-3" strokeWidth={2.2} />
      다시 시도
    </button>
  </div>
);

const UserMessage = ({ text }: { text: string }) => (
  <li className={cn('flex justify-end', MESSAGE_ENTER_CLASS_NAME)}>
    <p className="max-w-[78%] rounded-[18px_18px_5px_18px] bg-brand-600 px-3.5 py-[11px] text-sm leading-[1.55] font-medium tracking-[-0.01em] break-keep text-white [overflow-wrap:anywhere]">
      {text}
    </p>
  </li>
);

interface AssistantChatMessageItemProps {
  message: AssistantChatMessage;
  teamId: number;
  onRetryAnswer: (messageId: string) => void;
  onConfirmMeetingDraft: (messageId: string) => void;
  onMeetingLinkClick: () => void;
}

export const AssistantChatMessageItem = ({
  message,
  teamId,
  onRetryAnswer,
  onConfirmMeetingDraft,
  onMeetingLinkClick,
}: AssistantChatMessageItemProps) => {
  if (message.role === 'user') return <UserMessage text={message.text} />;

  return (
    <li className={cn('flex items-start gap-[9px]', MESSAGE_ENTER_CLASS_NAME)}>
      <AssistantChatAvatar className="size-8" />
      <div className="flex min-w-0 flex-1 flex-col items-start gap-2">
        <span className="mt-0.5 text-[11.5px] leading-none font-semibold text-cool-500">미티</span>
        {message.status === 'failed' ? (
          <FailedAnswer onRetry={() => onRetryAnswer(message.id)} />
        ) : message.text ? (
          <div className="max-w-[94%] rounded-[5px_18px_18px_18px] border border-cool-200 bg-white px-3.5 py-[11px] text-sm leading-[1.6] tracking-[-0.01em] break-keep text-cool-900 [overflow-wrap:anywhere]">
            <ChatMarkdown>{message.text}</ChatMarkdown>
          </div>
        ) : (
          <TypingIndicator />
        )}
        {message.meetingDraftStatus && (
          <AssistantChatMeetingDraftActions
            status={message.meetingDraftStatus}
            onConfirm={() => onConfirmMeetingDraft(message.id)}
          />
        )}
        {message.createdMeetingId !== undefined && (
          <Link
            href={`/teams/${teamId}/meetings/${message.createdMeetingId}`}
            onClick={onMeetingLinkClick}
            className="flex min-h-9 items-center gap-0.5 rounded-[18px] border border-brand-200 bg-white pr-2.5 pl-3.5 text-[13px] leading-none font-semibold text-brand-600 transition-colors hover:bg-brand-50"
          >
            회의 보러 가기
            <ChevronRight className="size-4" strokeWidth={2} />
          </Link>
        )}
      </div>
    </li>
  );
};
