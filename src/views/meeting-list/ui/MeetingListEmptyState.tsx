import Image from 'next/image';
import Link from 'next/link';

interface MeetingListEmptyStateProps {
  teamId: number;
}

export const MeetingListEmptyState = ({ teamId }: MeetingListEmptyStateProps) => (
  <div className="motion-safe:animate-in motion-safe:fade-in motion-safe:animation-duration-300 flex flex-1 flex-col items-center justify-center px-5 pb-10 text-center">
    <Image
      src="/brand/mascot/meety-08-thinking-transparent.png"
      alt=""
      width={136}
      height={136}
      className="size-34"
    />
    <h2 className="mt-3 text-[17px] font-semibold tracking-tight text-cool-900">
      아직 회의가 없어요
    </h2>
    <p className="mt-1.5 text-[13px] leading-relaxed text-cool-600">
      첫 회의를 만들면
      <br />
      이곳에 날짜별로 정리됩니다.
    </p>
    <Link
      href={`/teams/${teamId}/meetings/new`}
      className="mt-5.5 flex h-12 items-center rounded-xl bg-brand-600 px-5.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700 active:bg-brand-800"
    >
      회의 생성하기
    </Link>
  </div>
);
