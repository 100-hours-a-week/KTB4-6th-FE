import { Check, RotateCw } from 'lucide-react';
import type { AssistantChatMeetingDraftStatus } from '../model/types';

interface AssistantChatMeetingDraftActionsProps {
  status: AssistantChatMeetingDraftStatus;
  errorMessage?: string;
  onConfirm: () => void;
}

const CONFIRM_BUTTON_CLASS_NAME =
  'flex min-h-9 items-center gap-1.5 rounded-[18px] bg-brand-600 px-3.5 text-[13px] leading-none font-semibold text-white transition-[background-color,transform] hover:bg-brand-700 active:scale-[0.97]';

export const AssistantChatMeetingDraftActions = ({
  status,
  errorMessage,
  onConfirm,
}: AssistantChatMeetingDraftActionsProps) => {
  if (status === 'pending') {
    return (
      <button type="button" onClick={onConfirm} className={CONFIRM_BUTTON_CLASS_NAME}>
        <Check className="size-[13px]" strokeWidth={2.4} />
        확인
      </button>
    );
  }

  if (status === 'sending') {
    return (
      <span
        role="status"
        className="flex min-h-9 items-center gap-[7px] rounded-[18px] bg-cool-100 px-3.5 text-[13px] leading-none font-medium text-cool-500"
      >
        <span
          aria-hidden="true"
          className="size-[11px] rounded-full border-2 border-cool-300 border-t-cool-500 motion-safe:animate-spin"
        />
        요청 보내는 중
      </span>
    );
  }

  if (status === 'confirmed') {
    return (
      <span className="flex min-h-9 items-center gap-1.5 rounded-[18px] bg-success-bg px-[13px] text-[12.5px] leading-none font-semibold text-success">
        <Check className="size-3" strokeWidth={2.4} />
        확인함
      </span>
    );
  }

  if (status === 'expired') {
    return (
      <span className="flex min-h-9 items-center rounded-[18px] border border-cool-200 bg-cool-50 px-[13px] text-[12.5px] leading-none font-medium text-cool-400">
        회의 내용이 수정되었어요
      </span>
    );
  }

  return (
    <div role="alert" className="flex flex-wrap items-center gap-1.5">
      {errorMessage && (
        <p className="w-full text-xs leading-5 break-keep text-cool-600">{errorMessage}</p>
      )}
      <span className="flex min-h-9 items-center rounded-[18px] bg-danger-bg px-[13px] text-[12.5px] leading-none font-semibold text-danger">
        회의를 만들지 못했어요
      </span>
      <button type="button" onClick={onConfirm} className={CONFIRM_BUTTON_CLASS_NAME}>
        <RotateCw className="size-[13px]" strokeWidth={2.2} />
        다시 시도
      </button>
    </div>
  );
};
