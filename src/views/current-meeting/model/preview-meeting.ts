export type MeetingPreviewState =
  'waiting' | 'recording' | 'paused' | 'disconnected' | 'overtime' | 'ending';

export interface TranscriptSegment {
  id: string;
  speakerNumber: number | null;
  startedAtSeconds: number;
  text: string;
}

export interface CurrentMeetingViewModel {
  title: string;
  participantCount: number;
  participantLimit: number;
  targetMinutes: number;
  elapsedSeconds: number;
  recordingStatus: 'waiting' | 'recording' | 'paused' | 'ending';
  connectionStatus: 'connected' | 'disconnected';
  transcripts: TranscriptSegment[];
}

const sampleTranscripts: TranscriptSegment[] = [
  {
    id: 'segment-1',
    speakerNumber: 1,
    startedAtSeconds: 12,
    text: '오늘은 9월 스프린트 범위를 확정하겠습니다. 지난 스프린트 잔여 항목부터 보시죠.',
  },
  {
    id: 'segment-2',
    speakerNumber: 2,
    startedAtSeconds: 41,
    text: '온보딩 개선은 디자인이 아직 안 끝나서 이번 스프린트에 넣기 어려울 것 같아요.',
  },
  {
    id: 'segment-3',
    speakerNumber: 1,
    startedAtSeconds: 68,
    text: '그러면 결제 모듈 연동을 먼저 올리고 온보딩은 다음으로 미루겠습니다.',
  },
  {
    id: 'segment-4',
    speakerNumber: 3,
    startedAtSeconds: 95,
    text: '결제 쪽은 외부 연동 범위를 오늘 확정해야 일정이 나옵니다.',
  },
  {
    id: 'segment-5',
    speakerNumber: null,
    startedAtSeconds: 122,
    text: '외부 연동은 상대 쪽 응답을 아직 못 받았습니다.',
  },
  {
    id: 'segment-6',
    speakerNumber: 2,
    startedAtSeconds: 150,
    text: '그럼 기획 회의를 8월 28일 10시로 잡는 걸로 하시죠.',
  },
  {
    id: 'segment-7',
    speakerNumber: 1,
    startedAtSeconds: 178,
    text: '좋습니다. QA 인력 충원 건은 예산 확인 후 다시 논의하겠습니다.',
  },
  {
    id: 'segment-8',
    speakerNumber: 3,
    startedAtSeconds: 201,
    text: '네, 이번 주 안에 답변 드리겠습니다.',
  },
];

const baseMeeting = {
  title: '기획 리뷰 회의',
  participantCount: 3,
  participantLimit: 5,
  targetMinutes: 30,
  connectionStatus: 'connected' as const,
};

const previews: Record<MeetingPreviewState, CurrentMeetingViewModel> = {
  waiting: {
    ...baseMeeting,
    elapsedSeconds: 0,
    recordingStatus: 'waiting',
    transcripts: [],
  },
  recording: {
    ...baseMeeting,
    elapsedSeconds: 279,
    recordingStatus: 'recording',
    transcripts: sampleTranscripts,
  },
  paused: {
    ...baseMeeting,
    elapsedSeconds: 1465,
    recordingStatus: 'paused',
    transcripts: sampleTranscripts.slice(0, 5),
  },
  disconnected: {
    ...baseMeeting,
    connectionStatus: 'disconnected',
    elapsedSeconds: 1465,
    recordingStatus: 'recording',
    transcripts: sampleTranscripts,
  },
  overtime: {
    ...baseMeeting,
    elapsedSeconds: 1957,
    recordingStatus: 'recording',
    transcripts: sampleTranscripts,
  },
  ending: {
    ...baseMeeting,
    elapsedSeconds: 1465,
    recordingStatus: 'ending',
    transcripts: sampleTranscripts.slice(0, 5),
  },
};

export const getMeetingPreview = (state?: string): CurrentMeetingViewModel => {
  switch (state) {
    case 'recording':
    case 'paused':
    case 'disconnected':
    case 'overtime':
    case 'ending':
      return previews[state];
    default:
      return previews.waiting;
  }
};
