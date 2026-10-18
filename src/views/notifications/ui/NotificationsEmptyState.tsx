import { Bell } from 'lucide-react';

export const NotificationsEmptyState = () => (
  <div className="flex flex-1 flex-col items-center justify-center px-5 pb-20 text-center">
    <span className="flex size-17 items-center justify-center rounded-full bg-cool-100 text-cool-600">
      <Bell aria-hidden className="size-7" strokeWidth={1.75} />
    </span>
    <h2 className="mt-4 text-[17px] font-bold tracking-tight text-cool-900">
      받은 알림이 없습니다
    </h2>
    <p className="mt-1.5 text-sm text-cool-600">회의나 팀 소식이 생기면 여기에서 알려드릴게요</p>
  </div>
);
