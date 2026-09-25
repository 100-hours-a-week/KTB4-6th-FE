export interface MeetingSummary {
  overview: {
    period: string;
    participants: string[];
    purpose: string;
  };
  decisions: string[];
  assignees: { name: string; role: string }[];
  unresolvedItems: string[];
}

// TODO: AI 요약 조회 API가 생기면 응답으로 교체한다.
export const mockMeetingSummary: MeetingSummary = {
  overview: {
    period: '2026-08-25(화) 10:00 ~ 13:00',
    participants: ['신짱구', '김철수', '맹구', '유리'],
    purpose: '9월 스프린트 범위 확정과 담당자 배정',
  },
  decisions: [
    '기획 회의를 8월 28일 10:00으로 확정',
    '온보딩 개선은 이번 스프린트 범위에서 제외',
    '금일 오후 6시에 팀 회식 진행',
  ],
  assignees: [
    { name: '신짱구', role: '결제 모듈 연동 기획 및 일정 수립' },
    { name: '김철수', role: '스프린트 범위 정리, 외부 연동 담당자 회신 확인' },
    { name: '맹구', role: 'QA 이슈 목록 정리 및 우선순위 배정' },
  ],
  unresolvedItems: [
    '외부 연동 범위: 상대 쪽 응답을 받은 뒤 다음 회의에서 재논의',
    'QA 인력 충원: 예산 확인 후 이번 주 안에 답변',
  ],
};
