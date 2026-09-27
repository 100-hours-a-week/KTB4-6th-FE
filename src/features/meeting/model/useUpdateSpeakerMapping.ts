'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateSpeakerMapping } from '../api/update-speaker-mapping';
import { meetingKeys } from './query-keys';
import type { UpdateSpeakerMappingRequest } from './types';

interface UpdateSpeakerMappingVariables extends UpdateSpeakerMappingRequest {
  transcriptSpeakerId: number;
}

/**
 * 발화자 연결을 저장하거나 해제한다.
 * 같은 발화자의 모든 발화에 표시 이름이 바뀌므로, 성공하면 전사 목록을 다시 조회한다.
 */
export const useUpdateSpeakerMapping = (meetingId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ transcriptSpeakerId, ...request }: UpdateSpeakerMappingVariables) =>
      updateSpeakerMapping(meetingId, transcriptSpeakerId, request),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: meetingKeys.transcript(meetingId) }),
  });
};
