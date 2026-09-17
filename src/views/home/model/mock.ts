import type { Meeting, TeamSummary } from './types';

// UI 목업용 더미 데이터. 실제 팀/회의 데이터 연동은 이번 작업 범위가 아니다.
export const mockTeamSummary: TeamSummary = {
  name: '프로덕트 디자인팀',
  memberCount: 5,
  inviteCode: 'K7M2Q9PX',
  totalMeetingCount: 32,
  totalDurationLabel: '5시간 20분',
};

export const mockMeetings: Meeting[] = [
  {
    id: 'meeting-1',
    title: '스프린트 킥오프',
    status: 'in_progress',
    scheduledAtLabel: '14:00 시작',
    dateLabel: '',
    durationLabel: '',
  },
  {
    id: 'meeting-2',
    title: '주간 싱크',
    status: 'completed',
    scheduledAtLabel: '',
    dateLabel: '오늘 10:00',
    durationLabel: '42분',
  },
  {
    id: 'meeting-3',
    title: '리서치 공유',
    status: 'completed',
    scheduledAtLabel: '',
    dateLabel: '오늘 09:00',
    durationLabel: '28분',
  },
  {
    id: 'meeting-4',
    title: 'QA 이슈 점검',
    status: 'completed',
    scheduledAtLabel: '',
    dateLabel: '오늘 08:30',
    durationLabel: '51분',
  },
];
