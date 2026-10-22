'use client';

import { useState } from 'react';
import { addDashboardDays, type DashboardData } from '@/features/dashboard';
import { toSelectedMeetingSummary } from '../model/target-comparison-view';
import { DashboardDateNavigator } from './DashboardDateNavigator';
import { DashboardTargetComparisonCard } from './DashboardTargetComparisonCard';
import { DashboardTargetComparisonChart } from './DashboardTargetComparisonChart';

interface DashboardDailyContentProps {
  dashboard: DashboardData;
  selectedDate: string;
  today: string;
  minDate: string;
  maxDate: string;
  onDateChange: (date: string) => void;
}

export const DashboardDailyContent = ({
  dashboard,
  selectedDate,
  today,
  minDate,
  maxDate,
  onDateChange,
}: DashboardDailyContentProps) => {
  const [selectedMeetingId, setSelectedMeetingId] = useState<number | null>(null);
  const defaultMeetingId = dashboard.meetings.at(-1)?.meetingId ?? null;
  const activeMeetingId = dashboard.meetings.some(
    ({ meetingId }) => meetingId === selectedMeetingId,
  )
    ? selectedMeetingId
    : defaultMeetingId;
  const selectedMeeting =
    dashboard.meetings.find(({ meetingId }) => meetingId === activeMeetingId) ?? null;
  const selectedMeetingSummary = selectedMeeting ? toSelectedMeetingSummary(selectedMeeting) : null;

  const selectDate = (date: string) => {
    setSelectedMeetingId(null);
    onDateChange(date);
  };

  return (
    <DashboardTargetComparisonCard
      totalMeetings={dashboard.summary.totalMeetings}
      totalDurationSeconds={dashboard.summary.totalMeetingDurationSeconds}
      selectedMeetingSummary={selectedMeetingSummary}
      dateNavigator={
        <DashboardDateNavigator
          selectedDate={selectedDate}
          today={today}
          minDate={minDate}
          maxDate={maxDate}
          onSelect={selectDate}
          onPrevious={() => selectDate(addDashboardDays(selectedDate, -1))}
          onNext={() => selectDate(addDashboardDays(selectedDate, 1))}
        />
      }
    >
      <DashboardTargetComparisonChart
        meetings={dashboard.meetings}
        selectedMeetingId={activeMeetingId}
        onSelect={setSelectedMeetingId}
      />
    </DashboardTargetComparisonCard>
  );
};
