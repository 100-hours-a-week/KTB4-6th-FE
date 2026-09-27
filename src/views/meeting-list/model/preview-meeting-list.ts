import type { Meeting } from './type';

// TODO: 회의 목록 조회 API 응답으로 교체한다.
export const mockMeetings: Meeting[] = [
  {
    id: 1,
    title: '스프린트 킥오프',
    status: 'in_progress',
    startedAtLabel: '2026.09.18 · 14:00 시작',
  },
  { id: 2, title: '디자인 리뷰', status: 'waiting', startedAtLabel: '2026.09.19 10:00' },
  {
    id: 3,
    title: '주간 싱크',
    status: 'completed',
    startedAtLabel: '2026.09.18 10:00',
    durationLabel: '42분',
  },
  {
    id: 4,
    title: '리서치 공유',
    status: 'completed',
    startedAtLabel: '2026.09.18 09:00',
    durationLabel: '28분',
  },
  {
    id: 5,
    title: 'QA 이슈 점검',
    status: 'completed',
    startedAtLabel: '2026.09.16 11:00',
    durationLabel: '51분',
  },
  {
    id: 6,
    title: '지표 정의 정리',
    status: 'completed',
    startedAtLabel: '2026.09.15 09:30',
    durationLabel: '33분',
  },
  {
    id: 7,
    title: '온보딩 플로우 리뷰',
    status: 'completed',
    startedAtLabel: '2026.09.11 13:30',
    durationLabel: '37분',
  },
  {
    id: 8,
    title: '월간 회고',
    status: 'completed',
    startedAtLabel: '2026.09.01 15:00',
    durationLabel: '1시간 6분',
  },
  {
    id: 9,
    title: '디자인 시스템 점검',
    status: 'completed',
    startedAtLabel: '2026.08.28 14:00',
    durationLabel: '45분',
  },
  {
    id: 10,
    title: '스프린트 계획',
    status: 'completed',
    startedAtLabel: '2026.08.25 10:30',
    durationLabel: '39분',
  },
];
