export const TeamManagementContentSkeleton = () => (
  <div className="animate-pulse px-5 pt-5">
    <div className="h-7 w-40 rounded-md bg-cool-100" />

    <div className="mt-4 grid grid-cols-[1.6fr_1fr] gap-3">
      <div className="h-20 rounded-xl bg-cool-100" />
      <div className="h-20 rounded-xl bg-cool-100" />
    </div>

    <div className="mt-8 h-5 w-24 rounded-md bg-cool-100" />
    <div className="mt-3 space-y-3">
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="h-12 rounded-md bg-cool-100" />
      ))}
    </div>
  </div>
);
