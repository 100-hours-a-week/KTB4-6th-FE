import type { ApiResponse } from './common';

export type SpeakerMappingType = 'TEAM_MEMBER' | 'CUSTOM_ALIAS' | 'NONE';

export interface SpeakerMappingSpeakerData {
  transcriptSpeakerId: number;
  speakerLabel: string;
  displayName: string;
  mappingType: SpeakerMappingType;
  mappedTeamMemberId: number | null;
  customAlias: string | null;
}

export interface SpeakerMappingParticipantData {
  teamMemberId: number;
  nickname: string;
}

export interface SpeakerMappingData {
  speaker: SpeakerMappingSpeakerData;
  participants: SpeakerMappingParticipantData[];
}

export type SpeakerMappingResponse = ApiResponse<SpeakerMappingData>;

export interface UpdateSpeakerMappingRequest {
  teamMemberId: number | null;
  customAlias: string | null;
}

export interface SpeakerMappingResultData {
  transcriptSpeakerId: number;
  speakerLabel: string;
  mappedTeamMemberId: number | null;
  customAlias: string | null;
}

export type UpdateSpeakerMappingResponse = ApiResponse<SpeakerMappingResultData>;
