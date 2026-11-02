'use client';

import { useUpdateSpeakerMapping } from '@/features/meeting';
import { withWaGwa } from '@/shared/lib';
import { useAppToast } from '@/shared/ui';

interface UseSpeakerLinkingParams {
  meetingId: number;
}

interface LinkTarget {
  memberId: string | null;
  name: string;
}

export const useSpeakerLinking = ({ meetingId }: UseSpeakerLinkingParams) => {
  const { showToast } = useAppToast();
  const update = useUpdateSpeakerMapping(meetingId);

  const save = async (
    transcriptSpeakerId: number,
    request: { teamMemberId: number | null; customAlias: string | null },
    successMessage: string,
  ) => {
    if (update.isPending) return false;

    try {
      await update.mutateAsync({ transcriptSpeakerId, ...request });
      showToast(successMessage, 'success');
      return true;
    } catch {
      showToast('팀 멤버 연결에 실패했습니다. 다시 시도해주세요.', 'danger');
      return false;
    }
  };

  const connect = (transcriptSpeakerId: number, { memberId, name }: LinkTarget) =>
    save(
      transcriptSpeakerId,
      memberId !== null
        ? { teamMemberId: Number(memberId), customAlias: null }
        : { teamMemberId: null, customAlias: name },
      `발화자가 ${withWaGwa(name)} 연결되었습니다`,
    );

  const unlink = (transcriptSpeakerId: number) =>
    save(
      transcriptSpeakerId,
      { teamMemberId: null, customAlias: null },
      '발화자 연결이 해제되었습니다',
    );

  return { isSaving: update.isPending, connect, unlink };
};
