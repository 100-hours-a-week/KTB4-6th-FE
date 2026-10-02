import { LoaderCircle } from 'lucide-react';
import Link from 'next/link';

interface CompletedMeetingLoadingStateProps {
  isPending: boolean;
  teamHomeHref: string;
}

/** 회의 상세를 아직 못 받았을 때(불러오는 중 또는 조회 실패) 화면 전체 자리에 보여준다. */
export const CompletedMeetingLoadingState = ({
  isPending,
  teamHomeHref,
}: CompletedMeetingLoadingStateProps) => (
  <div className="flex h-dvh min-h-[844px] flex-1 items-center justify-center bg-cool-50 px-6 text-center">
    <div>
      {isPending && (
        <LoaderCircle
          aria-hidden="true"
          className="mx-auto size-7 text-brand-600 motion-safe:animate-spin"
          strokeWidth={2}
        />
      )}
      <p className="mt-4 text-sm text-cool-600">
        {isPending ? '회의 정보를 불러오는 중입니다' : '회의 정보를 불러오지 못했습니다'}
      </p>
      {!isPending && (
        <Link
          href={teamHomeHref}
          className="mt-5 inline-flex h-12 w-full max-w-[220px] items-center justify-center rounded-xl bg-brand-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
        >
          팀 홈으로 이동
        </Link>
      )}
    </div>
  </div>
);
