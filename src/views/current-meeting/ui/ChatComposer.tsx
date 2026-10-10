'use client';

import type { FormEvent, KeyboardEvent } from 'react';
import { ArrowUp, CircleDollarSign } from 'lucide-react';
import { cn } from '@/shared/lib';

export const CHAT_QUESTION_MAX_LENGTH = 1000;

interface ChatComposerProps {
  creditBalance: number;
  creditCost: number;
  isProcessing: boolean;
  question: string;
  onQuestionChange: (question: string) => void;
  onSubmit: () => void;
}

export const ChatComposer = ({
  creditBalance,
  creditCost,
  isProcessing,
  question,
  onQuestionChange,
  onSubmit,
}: ChatComposerProps) => {
  const isCreditInsufficient = creditBalance < creditCost;
  const normalizedQuestion = question.trim();
  const isInputDisabled = isProcessing || isCreditInsufficient;
  const canSubmit =
    !isInputDisabled &&
    normalizedQuestion.length > 0 &&
    normalizedQuestion.length <= CHAT_QUESTION_MAX_LENGTH;
  const placeholder = isProcessing
    ? '답변을 생성하고 있어요'
    : isCreditInsufficient
      ? '크레딧이 부족합니다'
      : '회의 내용에 대해 질문해보세요';

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (canSubmit) onSubmit();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key !== 'Enter' || event.shiftKey || event.nativeEvent.isComposing) return;

    event.preventDefault();
    if (canSubmit) onSubmit();
  };

  return (
    <footer className="shrink-0 border-t border-cool-200 bg-white px-5 pt-3 pb-4">
      <div
        className={cn(
          'mb-2 flex items-center gap-1.5 text-xs',
          isCreditInsufficient ? 'text-amber-700' : 'text-cool-600',
        )}
      >
        <CircleDollarSign aria-hidden="true" className="size-3.5" strokeWidth={2} />
        {isCreditInsufficient ? (
          <span>팀 크레딧이 부족해 질문할 수 없어요.</span>
        ) : (
          <span>
            팀 크레딧 {creditBalance} · 질문 1회당 {creditCost} 크레딧
          </span>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex items-end gap-2">
        <label htmlFor="chat-question" className="sr-only">
          AI 채팅 질문
        </label>
        <textarea
          id="chat-question"
          name="question"
          rows={1}
          required
          minLength={1}
          maxLength={CHAT_QUESTION_MAX_LENGTH}
          disabled={isInputDisabled}
          value={question}
          placeholder={placeholder}
          onChange={(event) => onQuestionChange(event.target.value)}
          onKeyDown={handleKeyDown}
          className="max-h-28 min-h-12 min-w-0 flex-1 resize-none rounded-3xl border border-cool-200 bg-cool-50 px-4 py-3 text-sm leading-6 text-cool-900 outline-none transition-colors placeholder:text-cool-400 focus:border-brand-400 disabled:cursor-not-allowed disabled:bg-cool-100 disabled:text-cool-400"
        />
        <button
          type="submit"
          aria-label="질문 보내기"
          disabled={!canSubmit}
          className="flex size-12 shrink-0 items-center justify-center rounded-full bg-brand-600 text-white transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-cool-200 disabled:text-cool-400"
        >
          <ArrowUp aria-hidden="true" className="size-5" strokeWidth={2.5} />
        </button>
      </form>
    </footer>
  );
};
