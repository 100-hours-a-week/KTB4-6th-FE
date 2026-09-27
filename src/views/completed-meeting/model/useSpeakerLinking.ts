'use client';

import { useUpdateSpeakerMapping } from '@/features/meeting';
import { withWaGwa } from '@/shared/lib';
import { useAppToast } from '@/shared/ui';

interface UseSpeakerLinkingParams {
  meetingId: number;
  /** 개발 환경 전용 미리보기이면 저장하지 않고 성공한 것처럼 안내만 한다. */
  isPreview: boolean;
}

interface LinkTarget {
  /** 팀 멤버로 연결하면 멤버 ID */
  memberId: string | null;
  /** 안내 문구에 쓸 이름 (멤버 이름 또는 직접 입력한 별칭) */
  name: string;
}

/** 발화자 연결·해제 저장과 그 결과 안내(토스트)를 맡는다. */
export const useSpeakerLinking = ({ meetingId, isPreview }: UseSpeakerLinkingParams) => {
  const { showToast } = useAppToast();
  const update = useUpdateSpeakerMapping(meetingId);

  /** 저장했으면 true. 실패하면 false여서 모달을 열어 둔 채 다시 시도할 수 있다. */
  const save = async (
    transcriptSpeakerId: number,
    request: { teamMemberId: number | null; customAlias: string | null },
    successMessage: string,
  ) => {
    if (isPreview) {
      showToast(successMessage, 'success');
      return true;
    }
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
