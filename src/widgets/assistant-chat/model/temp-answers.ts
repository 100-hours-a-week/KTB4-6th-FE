const ANALYZE_ANSWER = `## QA 이슈 점검 회의 정리

**시간**: 목표 45분 · 실제 51분 (6분 초과)

### 핵심 결정
- P1 이슈 3건은 이번 주 안에 처리해요
- 기록 지연 안내는 하단 상태 바로 바꿔요

### 할 일
| 담당 | 내용 |
| --- | --- |
| 김민수 | 지연 감지 로직 점검 |
| 이지은 | 상태 바 문구 정리 |`;

const FIND_ANSWER = `'크레딧 차감 논의' 관련 회의를 2건 찾았어요.

1. **스프린트 회고** · 10월 20일 · 15분
   > 크레딧 차감은 질문을 보낸 시점에 바로 반영돼요.
2. **주간 싱크** · 10월 13일 · 36분
   > 주간 충전은 월요일 00시 기준으로 맞추기로 했어요.`;

const CREATE_ANSWER = `좋아요, 회의를 만들어 드릴게요.

회의 이름과 예정 시각, 목표 시간을 알려 주세요.`;

const MEETING_DRAFT_ANSWER = `회의 초안을 만들었어요.

- **회의 이름**: 주간 싱크
- **예정 시각**: 오늘 15:00
- **목표 시간**: 30분
- **참여자**: 김민수, 이지은, 박서연

내용이 맞으면 확인을 눌러 주세요. 바꿀 부분이 있으면 말로 알려 주셔도 돼요.`;

const FALLBACK_ANSWER = `아직 그 질문은 배우는 중이에요.

오른쪽 위 **?**를 누르면 제가 도와드릴 수 있는 질문을 볼 수 있어요.`;

export const TEMP_MEETING_CREATED_ANSWER = `'주간 싱크' 회의를 만들었어요!

녹음을 시작하면 제가 옆에서 기록할게요.`;

export const TEMP_CREATED_MEETING_ID = 101;

export type TempReply =
  | { kind: 'answer'; text: string; asksMeetingDetails: boolean }
  | { kind: 'meetingDraft'; text: string; willFail: boolean }
  | { kind: 'answerFailure' }
  | { kind: 'historyFailure' };

export const getTempReply = (question: string, isAwaitingMeetingDetails: boolean): TempReply => {
  if (/불러오기\s*실패/.test(question)) return { kind: 'historyFailure' };
  if (/답변\s*실패/.test(question)) return { kind: 'answerFailure' };
  if (isAwaitingMeetingDetails) {
    return { kind: 'meetingDraft', text: MEETING_DRAFT_ANSWER, willFail: /실패/.test(question) };
  }
  if (/생성|만들/.test(question)) {
    return { kind: 'answer', text: CREATE_ANSWER, asksMeetingDetails: true };
  }
  if (/분석|정리/.test(question)) {
    return { kind: 'answer', text: ANALYZE_ANSWER, asksMeetingDetails: false };
  }
  if (/찾|지난|과거/.test(question)) {
    return { kind: 'answer', text: FIND_ANSWER, asksMeetingDetails: false };
  }
  return { kind: 'answer', text: FALLBACK_ANSWER, asksMeetingDetails: false };
};
