'use client';

import Image from 'next/image';
import { Copy } from 'lucide-react';
import { useCopyInviteCode } from '@/entities/invite-code';
import { OnboardingActionButton } from './OnboardingActionButton';
import { OnboardingLayout } from './OnboardingLayout';

interface InviteCodeCompleteScreenProps {
  inviteCode: string;
  isRegenerating?: boolean;
  onMoveToTeamSpace?: () => void;
  onRegenerate?: () => void;
  status?: 'success' | 'error';
}

export const InviteCodeCompleteScreen = ({
  inviteCode,
  isRegenerating = false,
  onMoveToTeamSpace,
  onRegenerate,
  status = 'success',
}: InviteCodeCompleteScreenProps) => {
  const isSuccess = status === 'success';
  const { copyInviteCode, copyStatus } = useCopyInviteCode();

  const handleCopy = async () => {
    await copyInviteCode(inviteCode);
  };

  return (
    <OnboardingLayout
      step={3}
      totalSteps={3}
      centered={isSuccess}
      verticallyCentered={isSuccess}
      badge={
        isSuccess ? (
          <Image
            src="/brand/mascot/meety-01-excited-transparent.png"
            alt=""
            width={112}
            height={112}
            className="mx-auto h-28 w-28"
          />
        ) : (
          <div className="inline-flex items-center gap-2 rounded-lg bg-success-bg px-3 py-2 text-sm font-semibold text-success">
            <span aria-hidden="true" className="size-2 rounded-full bg-success" />
            초대 코드 생성 실패
          </div>
        )
      }
      title={
        isSuccess ? (
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
        )
      }
      description={
        isSuccess ? (
          <>
            이 코드를 팀원에게 공유하면
            <br />
            같은 팀 스페이스로 들어옵니다.
          </>
        ) : (
          <>
            팀 스페이스는 생성되었습니다.
            <br />
            초대 코드만 다시 생성해주세요.
          </>
        )
      }
      action={
        isSuccess ? (
          <OnboardingActionButton type="button" onClick={onMoveToTeamSpace}>
            팀 스페이스로 이동
          </OnboardingActionButton>
        ) : null
      }
    >
      <div
        className={
          isSuccess
            ? 'rounded-2xl bg-cool-50 px-5 py-4'
            : 'rounded-2xl border border-brand-100 bg-brand-50 px-5 py-7 text-center'
        }
      >
        {isSuccess ? (
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs text-cool-500">초대 코드</p>
              <p className="mt-1 font-mono text-2xl font-semibold tracking-[0.14em] text-cool-900">
                {inviteCode}
              </p>
            </div>
            <button
              type="button"
              disabled={copyStatus === 'copying'}
              onClick={() => void handleCopy()}
              className="inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-lg border border-cool-200 bg-white px-3 text-sm font-semibold text-cool-700 transition-colors hover:bg-cool-50 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-brand-300 disabled:pointer-events-none disabled:opacity-60"
            >
              <Copy className="size-4" aria-hidden="true" />
              복사
            </button>
          </div>
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
    </OnboardingLayout>
  );
};
