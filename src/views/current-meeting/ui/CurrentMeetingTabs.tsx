import { cn } from '@/shared/lib';

export type CurrentMeetingTab = 'transcript' | 'chat';

interface CurrentMeetingTabsProps {
  activeTab: CurrentMeetingTab;
  onTabChange: (tab: CurrentMeetingTab) => void;
}

const tabs: { value: CurrentMeetingTab; label: string }[] = [
  { value: 'transcript', label: '실시간 녹취' },
  { value: 'chat', label: 'AI 채팅' },
];

export const CurrentMeetingTabs = ({ activeTab, onTabChange }: CurrentMeetingTabsProps) => (
  <nav aria-label="현재 회의 콘텐츠" className="shrink-0 border-b border-cool-200 bg-white px-5">
    <div role="tablist" className="grid grid-cols-2">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.value;

        return (
          <button
            key={tab.value}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onTabChange(tab.value)}
            className={cn(
              'relative h-13 text-sm font-semibold transition-colors',
              isActive ? 'text-cool-900' : 'text-cool-500 hover:text-cool-700',
            )}
          >
            {tab.label}
            {isActive && (
              <span
                aria-hidden="true"
                className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-brand-600"
              />
            )}
          </button>
        );
      })}
    </div>
  </nav>
);
