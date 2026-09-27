/** 회의 목록을 불러오는 동안 목록 영역 자리에 보여준다. 헤더는 포함하지 않는다. */
export const MeetingListSkeleton = () => (
  <section
    role="status"
    aria-label="회의 목록을 불러오는 중"
    className="mt-6 flex flex-1 flex-col px-5 pb-8 motion-safe:animate-pulse"
  >
    <div className="flex items-center justify-between">
      <div className="h-5 w-20 rounded-md bg-cool-100" />
      <div className="h-4 w-12 rounded-md bg-cool-100" />
    </div>

    <div className="mt-3 flex flex-col gap-2.5">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="h-[70px] rounded-2xl bg-cool-100" />
      ))}
    </div>
  </section>
);
