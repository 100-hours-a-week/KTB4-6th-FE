import { Menu, MoreVertical } from 'lucide-react';

const TAB_COUNT = 2;
const TRANSCRIPT_ROW_WIDTHS = ['w-full', 'w-[85%]', 'w-full', 'w-3/4', 'w-[90%]', 'w-full'];

export const MeetingRouteSkeleton = () => (
  <div
    role="status"
    aria-label="회의 정보를 불러오는 중입니다"
    className="flex min-h-0 flex-1 flex-col bg-cool-50"
  >
    <div aria-hidden="true" className="shrink-0 bg-white">
      <div className="flex items-start gap-2 px-5 pt-5 pb-4">
        <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center text-cool-400">
          <Menu className="size-5" strokeWidth={2} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex h-7 items-center">
            <div className="h-5 w-2/3 rounded-md bg-cool-100" />
          </div>
          <div className="mt-1 flex h-4 items-center">
            <div className="h-3 w-1/2 rounded-md bg-cool-100" />
          </div>
        </div>
        <div className="flex size-9 shrink-0 items-center justify-center text-cool-400">
          <MoreVertical className="size-5" strokeWidth={2} />
        </div>
      </div>
      <div className="flex border-b border-cool-200">
        {Array.from({ length: TAB_COUNT }, (_, index) => (
          <div
            key={index}
            className="flex flex-1 justify-center border-b-2 border-transparent py-3.5"
          >
            <div className="flex h-6 items-center">
              <div className="h-4 w-8 rounded-md bg-cool-100" />
            </div>
          </div>
        ))}
      </div>
    </div>

    <div
      aria-hidden="true"
      className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden px-5 py-5"
    >
      <div className="h-12 shrink-0 rounded-xl border border-cool-200 bg-white" />
      <div className="flex flex-col gap-2">
        {TRANSCRIPT_ROW_WIDTHS.map((textWidth, index) => (
          <div key={index} className="flex items-start gap-3.5 rounded-2xl bg-white/60 px-3 py-3.5">
            <div className="flex w-[68px] shrink-0 flex-col gap-2">
              <div className="h-3.5 w-3/4 rounded-md bg-cool-100" />
              <div className="h-3 w-1/2 rounded-md bg-cool-100" />
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <div className={`h-3.5 rounded-md bg-cool-100 ${textWidth}`} />
              <div className="h-3.5 w-2/3 rounded-md bg-cool-100" />
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);
