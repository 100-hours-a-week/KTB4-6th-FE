export const NotificationsSkeleton = () => (
  <ul role="status" aria-label="알림을 불러오는 중" className="motion-safe:animate-pulse">
    {Array.from({ length: 5 }).map((_, index) => (
      <li key={index} className="flex items-center gap-3.5 border-b border-cool-200 px-5 py-4">
        <div className="flex flex-1 items-start gap-3.5">
          <div className="size-10 shrink-0 rounded-xl bg-cool-100" />
          <div className="flex-1">
            <div className="h-[21px] py-0.5">
              <div className="h-full w-4/5 rounded bg-cool-100" />
            </div>
            <div className="mt-1 h-[18px] py-0.5">
              <div className="h-full w-12 rounded bg-cool-100" />
            </div>
          </div>
        </div>
        <div className="h-5 w-8 rounded bg-cool-100" />
      </li>
    ))}
  </ul>
);
