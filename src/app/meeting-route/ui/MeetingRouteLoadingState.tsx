import { LoaderCircle } from 'lucide-react';
import Link from 'next/link';

interface MeetingRouteLoadingStateProps {
  isPending: boolean;
  teamHomeHref: string;
}

export const MeetingRouteLoadingState = ({
  isPending,
  teamHomeHref,
}: MeetingRouteLoadingStateProps) => (
  <div className="flex min-h-0 flex-1 items-center justify-center bg-cool-50 px-6 text-center">
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
