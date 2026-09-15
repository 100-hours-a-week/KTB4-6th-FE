'use client';

import { Copy } from 'lucide-react';
import { useCopyToClipboard } from '@/shared/lib';
import { OnboardingActionButton } from './OnboardingActionButton';

interface InviteCodeCompleteScreenProps {
  inviteCode?: string;
  isRegenerating?: boolean;
  onMoveToTeamSpace?: () => void;
  onRegenerate?: () => void;
  status?: 'success' | 'error';
}

export const InviteCodeCompleteScreen = ({
  inviteCode = 'K7M2Q9PX',
  isRegenerating = false,
  onMoveToTeamSpace,
  onRegenerate,
  status = 'success',
}: InviteCodeCompleteScreenProps) => {
  const isSuccess = status === 'success';
  const { copyStatus, copyToClipboard } = useCopyToClipboard();

  const handleCopy = async () => {
    await copyToClipboard(inviteCode);
  };

  return (
    <main className="relative flex min-h-[844px] flex-1 flex-col bg-white px-7 pt-32 pb-9">
      <section>
        <div className="inline-flex items-center gap-2 rounded-lg bg-success-bg px-3 py-2 text-sm font-semibold text-success">
          <span aria-hidden="true" className="size-2 rounded-full bg-success" />
          {isSuccess ? '팀 스페이스 생성 완료' : '초대 코드 생성 실패'}
        </div>

        <h1 className="mt-5 text-[2rem] leading-[1.4] font-bold tracking-[-0.035em] text-cool-900">
          {isSuccess ? (
            <>
              초대 코드가
              <br />
              생성되었어요
            </>
          ) : (
            <>
              초대 코드 생성에
              <br />
              실패했어요
            </>
          )}
        </h1>

        <p className="mt-3 text-base leading-7 text-cool-600">
          {isSuccess
            ? '이 코드를 팀원에게 공유하면 같은 팀 스페이스로 들어옵니다.'
            : '팀 스페이스는 생성되었습니다. 초대 코드만 다시 생성해주세요.'}
        </p>

        <div className="mt-8 rounded-2xl border border-brand-100 bg-brand-50 px-5 py-7 text-center">
          {isSuccess ? (
            <>
              <p className="font-mono text-xs font-semibold tracking-[0.24em] text-brand-500">
                INVITE CODE
              </p>
              <p className="mt-3 font-mono text-[2.25rem] font-semibold tracking-[0.18em] text-brand-900">
                {inviteCode}
              </p>
              <button
                type="button"
                disabled={copyStatus === 'copying'}
                onClick={() => void handleCopy()}
                className="mx-auto mt-4 inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-brand-200 bg-white px-5 text-sm font-semibold text-brand-600 transition-colors hover:bg-brand-50 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-brand-300 disabled:pointer-events-none disabled:opacity-60"
              >
                <Copy className="size-4" aria-hidden="true" />
                코드 복사하기
              </button>
            </>
          ) : (
            <>
              <p className="text-base font-semibold text-cool-600">코드 생성 실패</p>
              <OnboardingActionButton
                type="button"
                className="mt-5"
                isLoading={isRegenerating}
                onClick={onRegenerate}
              >
                코드 재생성
              </OnboardingActionButton>
            </>
          )}
        </div>
      </section>

      <div className="mt-auto pt-10">
        {isSuccess ? (
          <OnboardingActionButton type="button" onClick={onMoveToTeamSpace}>
            팀 스페이스로 이동
          </OnboardingActionButton>
        ) : null}
      </div>

      {copyStatus === 'success' || copyStatus === 'error' ? (
        <div
          role={copyStatus === 'error' ? 'alert' : 'status'}
          className="absolute right-7 bottom-28 left-7 rounded-xl bg-cool-900 px-4 py-3 text-center text-sm font-medium text-white shadow-lg"
        >
          {copyStatus === 'success'
            ? '초대 코드가 복사되었습니다.'
            : '초대 코드 복사에 실패했습니다. 다시 시도해주세요.'}
        </div>
      ) : null}
    </main>
  );
};
