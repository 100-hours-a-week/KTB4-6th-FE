export interface TranscriptEntry {
  id: string;
  /** 팀 멤버와 연결된 발화자는 이름, 연결되지 않은 발화자는 `발화자 N` */
  speakerLabel: string;
  isSpeakerLinked: boolean;
  /** 팀 멤버와 연결된 발화자의 멤버 ID. 직접 입력한 별칭으로 연결됐거나 연결되지 않았으면 없음 */
  linkedMemberId?: string;
  startedAtSeconds: number;
  text: string;
}

// TODO: 전사 목록 조회 API(GET /api/v1/meetings/{meetingId}/transcripts) 응답으로 교체한다.
export const mockTranscriptEntries: TranscriptEntry[] = [
  {
    id: 'entry-1',
    speakerLabel: '발화자 1',
    isSpeakerLinked: false,
    startedAtSeconds: 12,
    text: '오늘은 9월 스프린트 범위를 확정하려고 합니다. 먼저 지난 스프린트에서 넘어온 항목부터 정리하겠습니다.',
  },
  {
    id: 'entry-2',
    speakerLabel: '김철수',
    isSpeakerLinked: true,
    linkedMemberId: 'member-1',
    startedAtSeconds: 41,
    text: '온보딩 개선은 디자인이 아직 안 끝나서 이번 스프린트에 넣기 어려울 것 같습니다.',
  },
  {
    id: 'entry-3',
    speakerLabel: '발화자 2',
    isSpeakerLinked: false,
    startedAtSeconds: 68,
    text: '그러면 결제 모듈 연동을 먼저 올리고 온보딩은 다음으로 미루는 게 좋겠네요.',
  },
  {
    id: 'entry-4',
    speakerLabel: '김철수',
    isSpeakerLinked: true,
    linkedMemberId: 'member-1',
    startedAtSeconds: 95,
    text: '동의합니다. 대신 결제 쪽은 외부 연동 범위를 오늘 확정해야 일정이 나옵니다.',
  },
  {
    id: 'entry-5',
    speakerLabel: '맹구',
    isSpeakerLinked: true,
    startedAtSeconds: 122,
    text: '외부 연동은 상대 쪽 응답을 아직 못 받아서, 다음 회의에서 다시 이야기하시죠.',
  },
  {
    id: 'entry-6',
    speakerLabel: '발화자 1',
    isSpeakerLinked: false,
    startedAtSeconds: 150,
    text: '좋습니다. 그럼 기획 회의를 8월 28일 10시로 잡겠습니다.',
  },
  {
    id: 'entry-7',
    speakerLabel: '유리',
    isSpeakerLinked: true,
    startedAtSeconds: 178,
    text: 'QA 인력 충원 건은 예산 확인이 먼저라 이번 주 안에 답을 드리겠습니다.',
  },
  {
    id: 'entry-8',
    speakerLabel: '발화자 2',
    isSpeakerLinked: false,
    startedAtSeconds: 201,
    text: '그럼 오늘 회의는 여기까지 하고, 금요일 오후 6시에 팀 회식으로 모이겠습니다.',
  },
];
