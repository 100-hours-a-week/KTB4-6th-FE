export const HomePageSkeleton = () => (
  <div className="flex min-h-[844px] flex-1 animate-pulse flex-col bg-cool-50">
    <div className="flex items-center px-5 py-4">
      <div className="size-9 rounded-full bg-cool-100" />
      <div className="ml-2 h-5 w-16 rounded-md bg-cool-100" />
    </div>

    <div className="mx-5 h-56 rounded-2xl bg-cool-100" />

    <div className="mt-5 px-5">
      <div className="h-14 rounded-2xl bg-cool-100" />
    </div>

    <div className="mt-6 px-5">
      <div className="h-5 w-28 rounded-md bg-cool-100" />
      <div className="mt-3 flex flex-col gap-2.5">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="h-[68px] rounded-2xl bg-cool-100" />
        ))}
      </div>
    </div>
  </div>
);
