export const DASHBOARD_INFO = {
  averageDuration: {
    label: '평균 회의 시간',
    descriptionLines: ['총 회의 시간을 종료된 회의 수로 나눈 값이에요.'],
  },
  goalAchievement: {
    label: '목표 달성률',
    descriptionLines: ['목표 시간을 지켰거나 단축한 회의가', '종료된 회의 중 몇 %인지 보여줘요.'],
  },
  contextOut: {
    label: '맥락에서 벗어난 시간',
    descriptionLines: [
      'AI가 회의 목적과 관련 없다고 판단한 발언 시간을 더한 값이에요.',
      '전체 회의 시간에서 차지하는 비율도 함께 보여줘요.',
    ],
  },
  targetComparison: {
    label: '목표 대비 회의 시간',
    descriptionLines: [
      '점선이 목표 시간이에요.',
      '회의가 목표보다 길어지면 막대가 위로, 일찍 끝나면 아래로 표시돼요.',
    ],
  },
  topTopics: {
    label: '안건별 논의 시간 Top 5',
    descriptionLines: ['선택한 기간의 모든 회의에서', '가장 오래 논의한 안건 5개예요.'],
  },
} as const;

export type DashboardInfoKey = keyof typeof DASHBOARD_INFO;
