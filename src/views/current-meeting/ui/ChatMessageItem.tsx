import Image from 'next/image';
import type { ChatMessageViewModel } from '../model/meeting-chat-messages';
import { ChatMarkdown } from './ChatMarkdown';

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

interface ChatMessageItemProps {
  message: ChatMessageViewModel;
}

export const ChatMessageItem = ({ message }: ChatMessageItemProps) => (
  <li className="flex flex-col gap-4">
    <UserQuestion message={message} />
    <MeetyAnswer message={message} />
  </li>
);
