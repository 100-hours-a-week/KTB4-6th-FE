import type { SpeakerMappingData } from '@/features/meeting';
import type { TeamMember } from './types';

export interface SpeakerLinkDialogData {
  speakerId: number;
  speakerLabel: string;
  members: TeamMember[];
  currentLink: { name: string; memberId?: string } | null;
}

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
      speakerId: speaker.transcriptSpeakerId,
      speakerLabel: speaker.speakerLabel,
      members,
      currentLink: { name: speaker.displayName, memberId: String(speaker.mappedTeamMemberId) },
    };
  }
  if (speaker.mappingType === 'CUSTOM_ALIAS') {
    return {
      speakerId: speaker.transcriptSpeakerId,
      speakerLabel: speaker.speakerLabel,
      members,
      currentLink: { name: speaker.customAlias ?? speaker.displayName },
    };
  }

  return {
    speakerId: speaker.transcriptSpeakerId,
    speakerLabel: speaker.speakerLabel,
    members,
    currentLink: null,
  };
};
