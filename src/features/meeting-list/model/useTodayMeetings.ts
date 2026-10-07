'use client';

import { useQuery } from '@tanstack/react-query';
import { getMeetingList } from '../api/get-meeting-list';
import { meetingListKeys } from './query-keys';

/** `today`는 KST 기준 `YYYY-MM-DD`. 하루치라 페이지가 나뉘지 않는다. */
export const useTodayMeetings = (teamId: number, today: string) =>
  useQuery({
    queryKey: meetingListKeys.today(teamId, today),
    queryFn: () => getMeetingList(teamId, { from: today, to: today }),
    // 오늘 회의는 다른 팀원이 시작·종료해 상태가 자주 바뀌므로, 화면으로 돌아올 때 다시 불러온다.
    refetchOnWindowFocus: true,
  });
