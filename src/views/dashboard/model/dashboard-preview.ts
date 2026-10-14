export const DASHBOARD_PREVIEW_SUMMARY = {
  totalMeetings: 15,
  totalMeetingDurationSeconds: 35100,
  averageMeetingDurationSeconds: 2340,
  overtimeMeetings: 4,
  overtimeMeetingRate: 26.67,
  overtimeDurationRate: 32.0,
  totalContextOutSeconds: 2300,
  contextOutRate: 6.55,
};

export const DASHBOARD_PREVIEW_CHART = [
  {
    startDate: '2026-09-15',
    endDate: '2026-09-18',
    targetDurationSeconds: 7200,
    actualDurationSeconds: 8400,
  },
  {
    startDate: '2026-09-19',
    endDate: '2026-09-22',
    targetDurationSeconds: 3600,
    actualDurationSeconds: 3300,
  },
  {
    startDate: '2026-09-23',
    endDate: '2026-09-26',
    targetDurationSeconds: 0,
    actualDurationSeconds: 0,
  },
  {
    startDate: '2026-09-27',
    endDate: '2026-09-30',
    targetDurationSeconds: 5400,
    actualDurationSeconds: 6000,
  },
  {
    startDate: '2026-10-01',
    endDate: '2026-10-04',
    targetDurationSeconds: 4800,
    actualDurationSeconds: 4500,
  },
  {
    startDate: '2026-10-05',
    endDate: '2026-10-08',
    targetDurationSeconds: 7200,
    actualDurationSeconds: 7800,
  },
  {
    startDate: '2026-10-09',
    endDate: '2026-10-12',
    targetDurationSeconds: 5100,
    actualDurationSeconds: 5100,
  },
];

export const DASHBOARD_PREVIEW_TOPICS = [
  { name: 'WebSocket ACK 방식', durationSeconds: 1200 },
  { name: '대시보드 설계', durationSeconds: 900 },
  { name: '실시간 전사 처리', durationSeconds: 720 },
  { name: '배포 및 인프라', durationSeconds: 600 },
  { name: '테스트 계획', durationSeconds: 480 },
];
