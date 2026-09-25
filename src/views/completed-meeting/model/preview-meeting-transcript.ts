export interface TranscriptEntry {
  id: string;
  /** 서버가 준 발화자 표시 이름 (팀원 이름, 별칭, 또는 연결되지 않은 `화자 1` 같은 이름) */
  speakerName: string;
  /** 개발 미리보기의 연결 모달 초기 상태용. 실제 연결 상태는 발화자 매핑 조회로 확인한다. */
  isSpeakerLinked?: boolean;
  /** 개발 미리보기용. 팀 멤버와 연결된 발화자의 멤버 ID */
  linkedMemberId?: string;
  /** 음성 파일 시작을 기준으로 이 발화가 시작된 시각(ms) */
  startedAtMs: number;
  endedAtMs: number;
  text: string;
}

// TODO: 전사 목록 조회 API(GET /api/v1/meetings/{meetingId}/transcripts) 응답으로 교체한다.
export const mockTranscriptEntries: TranscriptEntry[] = [
  {
    id: 'entry-1',
    speakerName: '화자 1',
    isSpeakerLinked: false,
    startedAtMs: 12000,
    endedAtMs: 39500,
    text: '오늘은 9월 스프린트 범위를 확정하려고 합니다. 먼저 지난 스프린트에서 넘어온 항목부터 정리하겠습니다.',
  },
  {
    id: 'entry-2',
    speakerName: '김철수',
    isSpeakerLinked: true,
    linkedMemberId: 'member-1',
    startedAtMs: 41000,
    endedAtMs: 66500,
    text: '온보딩 개선은 디자인이 아직 안 끝나서 이번 스프린트에 넣기 어려울 것 같습니다.',
  },
  {
    id: 'entry-3',
    speakerName: '화자 2',
    isSpeakerLinked: false,
    startedAtMs: 68000,
    endedAtMs: 93500,
    text: '그러면 결제 모듈 연동을 먼저 올리고 온보딩은 다음으로 미루는 게 좋겠네요.',
  },
  {
    id: 'entry-4',
    speakerName: '김철수',
    isSpeakerLinked: true,
    linkedMemberId: 'member-1',
    startedAtMs: 95000,
    endedAtMs: 120500,
    text: '동의합니다. 대신 결제 쪽은 외부 연동 범위를 오늘 확정해야 일정이 나옵니다.',
  },
  {
    id: 'entry-5',
    speakerName: '맹구',
    isSpeakerLinked: true,
    startedAtMs: 122000,
    endedAtMs: 148500,
    text: '외부 연동은 상대 쪽 응답을 아직 못 받아서, 다음 회의에서 다시 이야기하시죠.',
  },
  {
    id: 'entry-6',
    speakerName: '화자 1',
    isSpeakerLinked: false,
    startedAtMs: 150000,
    endedAtMs: 176500,
    text: '좋습니다. 그럼 기획 회의를 8월 28일 10시로 잡겠습니다.',
  },
  {
    id: 'entry-7',
    speakerName: '유리',
    isSpeakerLinked: true,
    startedAtMs: 178000,
    endedAtMs: 199500,
    text: 'QA 인력 충원 건은 예산 확인이 먼저라 이번 주 안에 답을 드리겠습니다.',
  },
  {
    id: 'entry-8',
    speakerName: '화자 2',
    isSpeakerLinked: false,
    startedAtMs: 201000,
    endedAtMs: 205000,
    text: '그럼 오늘 회의는 여기까지 하고, 금요일 오후 6시에 팀 회식으로 모이겠습니다.',
  },
];
