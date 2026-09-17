import { CreateMeetingButton } from './CreateMeetingButton';
import { HomeHeader } from './HomeHeader';
import { MeetingListSection } from './MeetingListSection';
import { TeamSummaryCard } from './TeamSummaryCard';
import { mockMeetings, mockTeamSummary } from '../model/mock';

export const HomePage = () => (
  <div className="flex min-h-[844px] flex-1 flex-col bg-cool-50">
    <HomeHeader />
    <TeamSummaryCard team={mockTeamSummary} />
    <CreateMeetingButton />
    <MeetingListSection meetings={mockMeetings} />
  </div>
);
