'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import { CircleAlert, MessageCircle } from 'lucide-react';
import { useMeetingChatList } from '@/features/meeting-chat';
import { useCurrentMeetingContext } from '../model/current-meeting-context';
import {
  formatChatMessageTime,
  mergeMeetingChatPages,
  type ChatMessageViewModel,
} from '../model/meeting-chat-messages';
import { mockChatComposer } from '../model/mock-chat-composer';
import { ChatComposer } from './ChatComposer';
import { ChatCreditNoticeDialog } from './ChatCreditNoticeDialog';
import { ChatMarkdown } from './ChatMarkdown';

const CHAT_CREDIT_COST = 1;

const getInitial = (displayName: string) => displayName.trim().charAt(0) || '?';

const UserQuestion = ({ message }: { message: ChatMessageViewModel }) => (
  <section aria-label={`${message.askerDisplayName}의 질문`} className="flex items-start gap-3">
    <span
      aria-hidden="true"
      className="flex size-10 shrink-0 items-center justify-center rounded-full bg-cool-100 text-sm font-bold text-cool-700"
    >
      {getInitial(message.askerDisplayName)}
    </span>
    <div className="min-w-0 flex-1">
      <div className="flex items-baseline gap-2">
        <h3 className="truncate text-sm font-bold text-cool-900">{message.askerDisplayName}</h3>
        <time className="shrink-0 text-xs text-cool-500">{message.createdAtLabel}</time>
      </div>
      <p className="mt-1.5 w-fit max-w-full rounded-2xl rounded-tl-md bg-cool-100 px-4 py-3 text-sm leading-6 break-words whitespace-pre-wrap text-cool-900">
        {message.question}
      </p>
    </div>
  </section>
);

const MeetyAvatar = () => (
  <span className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand-100">
    <Image
      src="/brand/mascot/meety-05-glasses.png"
      alt=""
      width={40}
      height={40}
      className="size-10 object-contain"
    />
  </span>
);

const ProcessingAnswer = () => (
  <div
    role="status"
    aria-label="답변을 생성하고 있습니다"
    className="mt-1.5 flex w-fit items-center gap-2 rounded-2xl rounded-tl-md border border-brand-200 bg-brand-50 px-4 py-3 text-sm text-cool-600"
  >
    <span aria-hidden="true" className="flex items-center gap-1">
      {[0, 1, 2].map((index) => (
        <span
          key={index}
          className="size-1.5 rounded-full bg-brand-400 motion-safe:animate-pulse"
          style={{ animationDelay: `${index * 160}ms` }}
        />
      ))}
    </span>
    회의 내용을 찾고 있어요
  </div>
);

const FailedAnswer = () => (
  <div
    role="alert"
    className="mt-1.5 rounded-2xl rounded-tl-md border border-danger/20 bg-danger-bg px-4 py-3"
  >
    <p className="text-sm font-semibold text-danger">답변을 만들지 못했어요</p>
    <p className="mt-1 text-xs leading-5 text-cool-600">잠시 후 다시 질문해주세요.</p>
  </div>
);

const MeetyAnswer = ({ message }: { message: ChatMessageViewModel }) => (
  <section aria-label="Meety의 답변" className="flex items-start gap-3">
    <MeetyAvatar />
    <div className="min-w-0 flex-1">
      <div className="flex items-baseline gap-2">
        <h3 className="text-sm font-bold text-brand-700">Meety</h3>
        {message.status === 'COMPLETED' && (
          <time className="text-xs text-cool-500">{message.createdAtLabel}</time>
        )}
      </div>
      {message.status === 'PROCESSING' ? (
        <ProcessingAnswer />
      ) : message.status === 'FAILED' ? (
        <FailedAnswer />
      ) : (
        message.answer && (
          <div className="mt-1.5 rounded-2xl rounded-tl-md border border-brand-200 bg-brand-50 px-4 py-3 text-sm leading-6 break-words text-cool-900">
            <ChatMarkdown>{message.answer}</ChatMarkdown>
          </div>
        )
      )}
    </div>
  </section>
);

const ChatLoadingState = () => (
  <div role="status" aria-label="채팅을 불러오는 중입니다" className="flex flex-col gap-7 py-2">
    {[0, 1].map((index) => (
      <div key={index} className="flex animate-pulse items-start gap-3">
        <span className="size-10 shrink-0 rounded-full bg-cool-200" />
        <div className="flex flex-1 flex-col gap-2 pt-1">
          <span className="h-3 w-24 rounded-full bg-cool-200" />
          <span className="h-18 rounded-2xl bg-cool-100" />
        </div>
      </div>
    ))}
  </div>
);

const ChatEmptyState = () => (
  <div className="flex flex-1 flex-col items-center justify-center px-5 pb-16 text-center">
    <span className="flex size-17 items-center justify-center rounded-full bg-brand-100 text-brand-600">
      <MessageCircle aria-hidden="true" className="size-7" strokeWidth={1.75} />
    </span>
    <h2 className="mt-4 text-[17px] font-bold tracking-tight text-cool-900">아직 질문이 없어요</h2>
    <p className="mt-1.5 text-sm leading-6 text-cool-600">
      회의 내용이 궁금할 때 Meety에게 질문해보세요
    </p>
  </div>
);

interface ChatErrorStateProps {
  isRetrying: boolean;
  onRetry: () => void;
}

const ChatErrorState = ({ isRetrying, onRetry }: ChatErrorStateProps) => (
  <div
    className="flex flex-1 flex-col items-center justify-center px-5 pb-16 text-center"
    role="alert"
  >
    <span className="flex size-17 items-center justify-center rounded-full bg-danger-bg text-danger">
      <CircleAlert aria-hidden="true" className="size-7" strokeWidth={1.75} />
    </span>
    <h2 className="mt-4 text-[17px] font-bold tracking-tight text-cool-900">
      채팅을 불러오지 못했어요
    </h2>
    <p className="mt-1.5 text-sm leading-6 text-cool-600">잠시 후 다시 시도해주세요.</p>
    <button
      type="button"
      disabled={isRetrying}
      onClick={onRetry}
      className="mt-4 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-cool-200 disabled:text-cool-400"
    >
      {isRetrying ? '불러오는 중' : '다시 시도'}
    </button>
  </div>
);

export const MeetingChat = () => {
  const { meetingId } = useCurrentMeetingContext();
  const { data, isPending, isError, isFetching, refetch } = useMeetingChatList(meetingId);
  const serverMessages = useMemo(() => mergeMeetingChatPages(data?.pages ?? []), [data?.pages]);
  const [localMessages, setLocalMessages] = useState<ChatMessageViewModel[]>([]);
  const [question, setQuestion] = useState('');
  const [creditBalance, setCreditBalance] = useState(mockChatComposer.creditBalance);
  const [hasAskedLocally, setHasAskedLocally] = useState(false);
  const [isCreditNoticeOpen, setIsCreditNoticeOpen] = useState(false);
  const messages = [...serverMessages, ...localMessages];
  const hasAskedQuestion = (data?.pages[0]?.hasAskedQuestion ?? false) || hasAskedLocally;
  const isProcessing = messages.some((message) => message.status === 'PROCESSING');

  const sendQuestion = () => {
    const normalizedQuestion = question.trim();
    if (!normalizedQuestion || isProcessing || creditBalance < CHAT_CREDIT_COST) return;

    const message: ChatMessageViewModel = {
      id: `local-chat-message-${Date.now()}`,
      messageId: null,
      askerTeamMemberId: null,
      askerDisplayName: mockChatComposer.currentUserDisplayName,
      createdAtLabel: formatChatMessageTime(new Date()),
      question: normalizedQuestion,
      status: 'PROCESSING',
      answer: null,
      citations: null,
    };

    setLocalMessages((currentMessages) => [...currentMessages, message]);
    setCreditBalance((currentCredit) => currentCredit - CHAT_CREDIT_COST);
    setQuestion('');
    setHasAskedLocally(true);
    setIsCreditNoticeOpen(false);
  };

  const handleSubmit = () => {
    if (hasAskedQuestion) {
      sendQuestion();
      return;
    }

    setIsCreditNoticeOpen(true);
  };

  if (isError && !data) {
    return <ChatErrorState isRetrying={isFetching} onRetry={() => void refetch()} />;
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-white">
      <main
        data-clarity-mask="true"
        className="flex min-h-0 flex-1 flex-col overflow-y-auto px-5 py-4"
      >
        <p className="mb-5 text-center text-xs text-cool-500">
          질문과 답변은 회의 참여자 모두에게 보여요
        </p>
        {isPending ? (
          <ChatLoadingState />
        ) : messages.length === 0 ? (
          <ChatEmptyState />
        ) : (
          <ol className="flex flex-col gap-7">
            {messages.map((message) => (
              <li key={message.id} className="flex flex-col gap-4">
                <UserQuestion message={message} />
                <MeetyAnswer message={message} />
              </li>
            ))}
          </ol>
        )}
      </main>

      <ChatComposer
        creditBalance={creditBalance}
        creditCost={CHAT_CREDIT_COST}
        isLoading={isPending}
        isProcessing={isProcessing}
        question={question}
        onQuestionChange={setQuestion}
        onSubmit={handleSubmit}
      />
      <ChatCreditNoticeDialog
        isOpen={isCreditNoticeOpen}
        currentCredit={creditBalance}
        creditCost={CHAT_CREDIT_COST}
        onCancel={() => setIsCreditNoticeOpen(false)}
        onConfirm={sendQuestion}
        onOpenChange={setIsCreditNoticeOpen}
      />
    </div>
  );
};
