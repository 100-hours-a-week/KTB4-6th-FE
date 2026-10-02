'use client';

import { useQueryClient } from '@tanstack/react-query';
import {
  MeetingApiError,
  meetingKeys,
  useUpdateMeeting,
  type MeetingDetailData,
} from '@/features/meeting';
import { useAppToast } from '@/shared/ui';

interface UseMeetingRenameParams {
  meetingId: number;
}

/** 종료된 회의의 이름을 바꾸는 요청과 결과 안내(토스트)를 맡는다. */
export const useMeetingRename = ({ meetingId }: UseMeetingRenameParams) => {
  const queryClient = useQueryClient();
  const { showToast } = useAppToast();
  const { mutate, isPending } = useUpdateMeeting();

  const rename = (title: string) => {
    mutate(
      { meetingId, title },
      {
        onSuccess: (updatedMeeting) => {
          queryClient.setQueryData<MeetingDetailData>(meetingKeys.detail(meetingId), (meeting) =>
            meeting ? { ...meeting, ...updatedMeeting } : meeting,
          );
          showToast('회의 이름이 변경되었습니다', 'success');
        },
        onError: (error) =>
          showToast(
            error instanceof MeetingApiError ? error.message : '회의 이름 변경에 실패했습니다.',
            'danger',
          ),
      },
    );
  };

  return { isRenaming: isPending, rename };
};
