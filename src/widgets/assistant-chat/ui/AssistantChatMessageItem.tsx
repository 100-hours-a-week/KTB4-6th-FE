import Link from 'next/link';
import { ChevronRight, RotateCw } from 'lucide-react';
import { cn } from '@/shared/lib';
import { ChatMarkdown } from '@/shared/markdown';
import type { AssistantChatMessage, AssistantChatPhase } from '../model/types';
import { AssistantChatAvatar } from './AssistantChatAvatar';
import { AssistantChatMeetingDraftActions } from './AssistantChatMeetingDraftActions';

const MESSAGE_ENTER_CLASS_NAME =
  'motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-1.5 motion-safe:duration-200';

const PHASE_LABELS: Record<AssistantChatPhase, string> = {
  SEARCHING_MEETINGS: '회의를 찾고 있어요',
  READING_MEETING: '회의 내용을 읽고 있어요',
  PREPARING_MEETING: '회의 초안을 준비하고 있어요',
};

const TypingIndicator = ({ phase }: { phase?: AssistantChatPhase }) => (
  <div
    role="status"
    aria-label={phase ? PHASE_LABELS[phase] : '미티가 답변을 준비하고 있어요'}
    className="flex items-center gap-2.5 rounded-[5px_18px_18px_18px] border border-cool-200 bg-white px-4 py-3.5"
  >
    <span aria-hidden="true" className="flex gap-[5px]">
      {[0, 1, 2].map((index) => (
        <span
          key={index}
          className="size-1.5 rounded-full bg-brand-500 motion-safe:animate-meety-typing"
          style={{ animationDelay: `${index * 150}ms` }}
        />
      ))}
    </span>
    {phase && (
      <span
        key={phase}
        aria-hidden="true"
        className="text-[13px] leading-none text-cool-500 motion-safe:animate-in motion-safe:fade-in motion-safe:duration-200"
      >
        {PHASE_LABELS[phase]}
      </span>
    )}
  </div>
);

const FailedAnswer = ({ onResend }: { onResend?: () => void }) => (
  <div
    role="alert"
    className="flex max-w-[94%] flex-col items-start gap-2.5 rounded-[5px_18px_18px_18px] border border-danger/20 bg-danger-bg px-3.5 py-[11px]"
  >
    <div>
      <p className="text-sm font-semibold text-danger">답변을 만들지 못했어요</p>
      <p className="mt-1 text-xs leading-5 text-cool-600">
        {onResend ? '같은 질문을 다시 보낼 수 있어요.' : '잠시 후 다시 질문해 주세요.'}
      </p>
    </div>
    {onResend && (
      <button
        type="button"
        onClick={onResend}
        className="flex min-h-8 items-center gap-1 rounded-full border border-cool-200 bg-white px-3 text-xs font-semibold text-cool-700 transition-colors hover:bg-cool-50"
      >
        <RotateCw className="size-3" strokeWidth={2.2} />
        다시 보내기
      </button>
    )}
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
  canResend: boolean;
  onResendQuestion: (messageId: string) => void;
  onConfirmMeetingDraft: (messageId: string) => void;
  onMeetingLinkClick: () => void;
}

export const AssistantChatMessageItem = ({
  message,
  teamId,
  canResend,
  onResendQuestion,
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
          <FailedAnswer onResend={canResend ? () => onResendQuestion(message.id) : undefined} />
        ) : message.text ? (
          <div className="max-w-[94%] rounded-[5px_18px_18px_18px] border border-cool-200 bg-white px-3.5 py-[11px] text-sm leading-[1.6] tracking-[-0.01em] break-keep text-cool-900 [overflow-wrap:anywhere]">
            <ChatMarkdown>{message.text}</ChatMarkdown>
          </div>
        ) : (
          <TypingIndicator phase={message.phase} />
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
            replace
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
