export interface TranscriptEntry {
  id: string;
  /** 서버가 준 발화자 표시 이름 (팀원 이름, 별칭, 또는 연결되지 않은 `화자 1` 같은 이름) */
  speakerName: string;
  /** 음성 파일 시작을 기준으로 이 발화가 시작된 시각(ms) */
  startedAtMs: number;
  endedAtMs: number;
  text: string;
}

export interface TeamMember {
  id: string;
  name: string;
}

export type CompletedMeetingViewerRole = 'leader' | 'member';
