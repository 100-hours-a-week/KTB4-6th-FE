import { cn, formatDurationSeconds } from '@/shared/lib';
import { DASHBOARD_INFO } from '../model/dashboard-info';
import { DashboardInfoPopover } from './DashboardInfoPopover';

interface DashboardTopic {
  name: string;
  durationSeconds: number;
}

interface DashboardTopicsCardProps {
  topics: DashboardTopic[];
}

export const DashboardTopicsCard = ({ topics }: DashboardTopicsCardProps) => {
  const maxDurationSeconds = Math.max(...topics.map((topic) => topic.durationSeconds), 1);

  return (
    <section
      aria-labelledby="dashboard-topics-title"
      className="flex shrink-0 flex-col gap-1.5 rounded-[20px] bg-white px-4 pt-4 pb-2 shadow-[0_2px_12px_rgba(31,53,85,0.07)]"
    >
      <div className="flex items-center justify-between gap-2 pb-1.5">
        <h2
          id="dashboard-topics-title"
          className="text-[17px] font-bold tracking-[-0.02em] text-cool-900"
        >
          {DASHBOARD_INFO.topTopics.label}
        </h2>
        <DashboardInfoPopover infoKey="topTopics" />
      </div>

      {topics.length === 0 ? (
        <p className="mb-2 flex h-[120px] items-center justify-center rounded-[10px] bg-cool-50 text-sm leading-[1.3] font-medium text-cool-600">
          논의된 안건이 없어요
        </p>
      ) : (
        <ol className="flex flex-col">
          {topics.map((topic, index) => {
            const isTop = index === 0;
            const ratio = (topic.durationSeconds / maxDurationSeconds) * 100;

            return (
              <li
                key={`${index}-${topic.name}`}
                className={cn(
                  'flex flex-col gap-2 pt-2.5 pb-3',
                  index > 0 && 'border-t border-cool-100',
                )}
              >
                <div className="flex items-center gap-2.5">
                  <span
                    aria-label={`${index + 1}위`}
                    className={cn(
                      'flex size-6 shrink-0 items-center justify-center rounded-full text-[13px] font-semibold tabular-nums',
                      isTop ? 'bg-brand-600 text-white' : 'bg-cool-100 text-cool-600',
                    )}
                  >
                    {index + 1}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-[15px] leading-[1.3] font-medium tracking-[-0.01em] text-cool-900">
                    {topic.name}
                  </span>
                  <span className="shrink-0 text-[15px] font-semibold whitespace-nowrap text-cool-900 tabular-nums">
                    {formatDurationSeconds(topic.durationSeconds)}
                  </span>
                </div>
                <div
                  aria-hidden="true"
                  className="ml-[34px] h-1.5 overflow-hidden rounded-[3px] bg-cool-100"
                >
                  <div
                    className={cn('h-full rounded-[3px]', isTop ? 'bg-brand-500' : 'bg-brand-200')}
                    style={{ width: `${ratio}%` }}
                  />
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
};
