'use client';

import { useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { homeKeys, useHome, type HomeData } from '@/features/home';
import {
  clearDismissedVoiceConsentPrompt,
  dismissVoiceConsentPrompt,
  useAgreeVoiceConsent,
} from '@/features/voice-profile';

interface VoiceConsentPageProps {
  teamId: number;
  isFullView: boolean;
}

const consentDetails = [
  { label: '수집 항목', value: '음성 등록용 녹음 파일(약 20초), 녹음에서 추출한 화자 특징 정보' },
  { label: '이용 목적', value: '회의 녹음에서 내 발언 구분' },
  {
    label: '보유 기간',
    value: '회원 탈퇴 시까지 (녹음 파일과 화자 특징 정보 모두 탈퇴 시 파기)',
  },
  { label: '처리', value: '녹음 파일 저장 AWS, 화자 특징 추출 Meety AI 서버' },
  {
    label: '거부 안내',
    value:
      '동의하지 않으면 회의록에서 누가 말했는지 구분하기 어려울 수 있어요. 회의 녹음·기록·요약은 그대로 이용할 수 있어요.',
  },
  { label: '철회 안내', value: '동의 철회를 원하면 문의 또는 회원 탈퇴' },
];

export const VoiceConsentPage = ({ teamId, isFullView }: VoiceConsentPageProps) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: home, isPending, isError, isFetching } = useHome({ isEnabled: true });
  const consent = useAgreeVoiceConsent();
  const homePath = `/teams/${teamId}`;
  const consentPath = `/teams/${teamId}/voice-consent`;
  const hasVoiceConsent = home?.team.teamId === teamId && home.hasVoiceConsent;
  const returnPath = hasVoiceConsent ? `/teams/${teamId}/manage` : consentPath;
  const showFullView = isFullView || hasVoiceConsent;

  const handleDecline = () => {
    dismissVoiceConsentPrompt(teamId);
    router.replace(homePath);
  };

  const handleAgree = async () => {
    if (consent.isPending) return;

    try {
      await consent.mutateAsync();
      clearDismissedVoiceConsentPrompt(teamId);
      queryClient.setQueryData<HomeData>(homeKeys.all, (currentHome) =>
        currentHome ? { ...currentHome, hasVoiceConsent: true } : currentHome,
      );
      router.replace(homePath);
    } catch {
      // Mutation error is displayed below the action buttons.
    }
  };

  if (isPending || (home && home.team.teamId !== teamId && isFetching)) {
    return (
      <main className="flex flex-1 items-center justify-center bg-white text-cool-500">
        불러오는 중...
      </main>
    );
  }

  if (isError || !home || home.team.teamId !== teamId) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center gap-4 bg-white px-7">
        <p role="alert" className="text-cool-700">
          동의 내용을 불러오지 못했어요.
        </p>
        <Link
          href={`/teams/${home?.team.teamId ?? teamId}`}
          className="font-semibold text-brand-600"
        >
          팀 스페이스로 돌아가기
        </Link>
      </main>
    );
  }

  return (
    <main className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-white px-6 pt-6 pb-8">
      <header className="flex items-center gap-2">
        {showFullView ? (
          <Link
            href={returnPath}
            aria-label="이전 화면으로 이동"
            className="-ml-2 flex size-10 items-center justify-center rounded-full text-cool-900 hover:bg-cool-50"
          >
            <ChevronLeft className="size-6" />
          </Link>
        ) : (
          <button
            type="button"
            onClick={handleDecline}
            aria-label="이전 화면으로 이동"
            className="-ml-2 flex size-10 items-center justify-center rounded-full text-cool-900 hover:bg-cool-50"
          >
            <ChevronLeft className="size-6" />
          </button>
        )}
        <span className="text-base font-semibold text-cool-900">
          {showFullView ? '동의 내용 전문' : '음성 정보 수집 동의'}
        </span>
      </header>

      <section className="mt-10">
        <h1 className="text-[clamp(16px,5vw,20px)] leading-[1.4] font-bold tracking-tight text-cool-900">
          <span className="block">[선택]</span>
          <span className="mt-1 block whitespace-nowrap">음성 정보 수집·이용동의 (민감정보)</span>
        </h1>
        <p className="mt-4 text-sm leading-6 text-cool-600">
          내 목소리를 등록하면 회의록에서 내 발언을 구분할 수 있어요.
        </p>

        {showFullView ? (
          <dl className="mt-8 divide-y divide-cool-100 rounded-xl border border-cool-100 px-4">
            {consentDetails.map(({ label, value }) => (
              <div key={label} className="py-4">
                <dt className="text-sm font-semibold text-cool-900">{label}</dt>
                <dd className="mt-2 text-sm leading-6 text-cool-600">{value}</dd>
              </div>
            ))}
          </dl>
        ) : (
          <>
            <div className="mt-8 rounded-xl bg-cool-50 p-4 text-sm leading-6 text-cool-700">
              <p>약 20초의 녹음 파일과 화자 특징 정보를 수집해 회의 녹음에서 내 발언을 구분해요.</p>
              <p className="mt-3">녹음 파일과 화자 특징 정보는 회원 탈퇴 시 파기해요.</p>
            </div>
            <Link
              href={`${consentPath}?view=full`}
              className="mt-5 inline-block text-sm font-semibold text-brand-600 underline underline-offset-4"
            >
              동의 내용 전문 보기
            </Link>
            <p className="mt-8 text-sm leading-6 text-cool-600">
              동의하지 않으면 회의록에서 누가 말했는지 구분하기 어려울 수 있어요. 회의
              녹음·기록·요약은 그대로 이용할 수 있어요.
            </p>
          </>
        )}
      </section>

      {showFullView ? (
        <div className="mt-auto pt-10">
          <Link
            href={returnPath}
            className="flex min-h-14 items-center justify-center rounded-xl border border-cool-300 px-5 font-semibold text-cool-700"
          >
            {hasVoiceConsent ? '팀 관리로 돌아가기' : '동의 화면으로 돌아가기'}
          </Link>
        </div>
      ) : (
        <div className="mt-auto flex flex-col gap-3 pt-10">
          {consent.isError && (
            <p role="alert" className="text-sm text-danger">
              동의를 저장하지 못했어요. 다시 시도해 주세요.
            </p>
          )}
          <button
            type="button"
            disabled={consent.isPending}
            onClick={() => void handleAgree()}
            className="min-h-14 rounded-xl bg-brand-600 px-5 font-semibold text-white disabled:opacity-60"
          >
            {consent.isPending ? '동의 저장 중...' : '동의하고 등록하기'}
          </button>
          <button
            type="button"
            disabled={consent.isPending}
            onClick={handleDecline}
            className="min-h-12 rounded-xl font-semibold text-cool-600 disabled:opacity-60"
          >
            동의하지 않음
          </button>
        </div>
      )}
    </main>
  );
};
