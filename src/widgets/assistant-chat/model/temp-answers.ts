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

const FALLBACK_ANSWER = `아직 그 질문은 배우는 중이에요.
오른쪽 위 **?**를 누르면 제가 도와드릴 수 있는 질문을 볼 수 있어요.`;

export const getTempAnswer = (question: string) => {
  if (/분석|정리/.test(question)) return ANALYZE_ANSWER;
  if (/찾|지난|과거/.test(question)) return FIND_ANSWER;
  if (/생성|만들/.test(question)) return CREATE_ANSWER;
  return FALLBACK_ANSWER;
};
