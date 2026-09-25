import type { SpeakerMappingData } from '@/features/meeting';
import type { TeamMember } from './preview-team-members';

/** 발화자 연결 모달이 그릴 데이터 */
export interface SpeakerLinkDialogData {
  /** 연결되지 않은 발화자의 이름(`화자 1`) */
  speakerLabel: string;
  /** 연결할 수 있는 회의 참석자 */
  members: TeamMember[];
  /** 이미 연결되어 있으면 현재 연결 정보. 직접 입력한 별칭이면 memberId가 없다. */
  currentLink: { name: string; memberId?: string } | null;
}

/** 발화자 매핑 조회 응답을 연결 모달이 그릴 데이터로 바꾼다. */
export const toSpeakerLinkDialogData = ({
  speaker,
  participants,
}: SpeakerMappingData): SpeakerLinkDialogData => {
  const members = participants.map(({ teamMemberId, nickname }) => ({
    id: String(teamMemberId),
    name: nickname,
  }));

  if (speaker.mappingType === 'TEAM_MEMBER' && speaker.mappedTeamMemberId !== null) {
    return {
      speakerLabel: speaker.speakerLabel,
      members,
      currentLink: { name: speaker.displayName, memberId: String(speaker.mappedTeamMemberId) },
    };
  }
  if (speaker.mappingType === 'CUSTOM_ALIAS') {
    return {
      speakerLabel: speaker.speakerLabel,
      members,
      currentLink: { name: speaker.customAlias ?? speaker.displayName },
    };
  }

  return { speakerLabel: speaker.speakerLabel, members, currentLink: null };
};
