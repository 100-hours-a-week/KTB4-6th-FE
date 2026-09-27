import Link from 'next/link';
import { cn } from '@/shared/lib';
import { COMPLETED_MEETING_TABS, type CompletedMeetingTab } from '../model/completed-meeting-tab';

const TAB_LABELS: Record<CompletedMeetingTab, string> = {
  summary: '요약',
  transcript: '전사',
};

interface CompletedMeetingTabsProps {
  currentTab: CompletedMeetingTab;
  getTabHref: (tab: CompletedMeetingTab) => string;
}

export const CompletedMeetingTabs = ({ currentTab, getTabHref }: CompletedMeetingTabsProps) => (
  <nav aria-label="회의 상세 탭" className="flex border-b border-cool-200">
    {COMPLETED_MEETING_TABS.map((tab) => {
      const isCurrent = tab === currentTab;

      return (
        <Link
          key={tab}
          href={getTabHref(tab)}
          replace
          scroll={false}
          aria-current={isCurrent ? 'page' : undefined}
          className={cn(
            'flex-1 border-b-2 py-3.5 text-center text-base transition-colors',
            isCurrent
              ? 'border-brand-600 font-bold text-cool-900'
              : 'border-transparent font-medium text-cool-500',
          )}
        >
          {TAB_LABELS[tab]}
        </Link>
      );
    })}
  </nav>
);
