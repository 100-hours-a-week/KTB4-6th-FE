interface TimelineItemSkeletonProps {
  dotClassName: string;
  lineClassName: string;
  cardClassName: string;
}

const TimelineItemSkeleton = ({
  dotClassName,
  lineClassName,
  cardClassName,
}: TimelineItemSkeletonProps) => (
  <div className="relative pb-3 pl-5 last:pb-0">
    <span className={`absolute top-3 bottom-0 left-1 border-l-2 ${lineClassName}`} />
    <span className={`absolute top-[7px] left-0 size-[11px] rounded-full ${dotClassName}`} />
    <div className="flex h-[25px] items-center">
      <div className={`h-[15px] w-11 rounded ${cardClassName}`} />
    </div>
    <div className={`mt-2 h-[78px] rounded-xl ${cardClassName}`} />
  </div>
);

/** 회의 목록을 불러오는 동안 목록 영역 자리에 보여준다. 헤더는 포함하지 않는다. */
export const MeetingListSkeleton = () => (
  <section
    role="status"
    aria-label="회의 목록을 불러오는 중"
    className="mt-6 flex flex-1 flex-col px-5 pb-8 motion-safe:animate-pulse"
  >
    <div className="flex h-6 items-center">
      <div className="h-5 w-20 rounded-md bg-cool-100" />
    </div>

    <div className="mt-3 rounded-2xl border border-brand-200 bg-brand-100 p-4">
      <div className="flex h-6 items-center gap-2">
        <div className="h-5 w-8 rounded bg-white/70" />
        <div className="h-5 w-20 rounded bg-white/70" />
        <div className="h-4 w-12 rounded bg-white/70" />
      </div>
      <div className="mt-3.5 h-[120px] rounded-2xl bg-white/70" />
      <div className="mt-4 flex h-5 items-center gap-2">
        <div className="h-4 w-24 rounded bg-white/70" />
        <span className="h-px flex-1 bg-brand-200" />
      </div>
      <div className="mt-3 flex flex-col">
        {Array.from({ length: 2 }).map((_, index) => (
          <TimelineItemSkeleton
            key={index}
            dotClassName="bg-white/70"
            lineClassName="border-white/70"
            cardClassName="bg-white/70"
          />
        ))}
      </div>
    </div>

    <div className="mt-6 flex h-5 items-center gap-2">
      <div className="h-4 w-16 rounded bg-cool-100" />
      <span className="h-px flex-1 bg-cool-200" />
    </div>
    <div className="mt-4 flex flex-col gap-10">
      {Array.from({ length: 2 }).map((_, groupIndex) => (
        <div key={groupIndex}>
          <div className="flex h-6 items-center">
            <div className="h-5 w-28 rounded bg-cool-100" />
          </div>
          <div className="mt-3 flex flex-col">
            {Array.from({ length: 2 }).map((_, index) => (
              <TimelineItemSkeleton
                key={index}
                dotClassName="bg-cool-200"
                lineClassName="border-cool-200"
                cardClassName="bg-cool-100"
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  </section>
);
