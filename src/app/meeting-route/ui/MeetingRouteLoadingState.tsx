import Link from 'next/link';
import { MeetingRouteSkeleton } from './MeetingRouteSkeleton';

interface MeetingRouteLoadingStateProps {
  isPending: boolean;
  teamHomeHref: string;
}

export const MeetingRouteLoadingState = ({
  isPending,
  teamHomeHref,
}: MeetingRouteLoadingStateProps) => {
  if (isPending) return <MeetingRouteSkeleton />;

  return (
    <div className="flex min-h-0 flex-1 items-center justify-center bg-cool-50 px-6 text-center">
      <div>
        <p className="text-sm text-cool-600">회의 정보를 불러오지 못했습니다</p>
        <Link
          href={teamHomeHref}
          className="mt-5 inline-flex h-12 w-full max-w-[220px] items-center justify-center rounded-xl bg-brand-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
        >
          팀 홈으로 이동
        </Link>
      </div>
    </div>
  );
};
