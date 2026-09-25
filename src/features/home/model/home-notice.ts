/** 다른 화면에서 홈으로 돌아올 때 홈이 대신 알려줄 안내의 종류. 주소의 notice 값으로 전달한다. */
export const HOME_NOTICE_MEETING_DELETED = 'meeting-deleted';

/** 팀 홈 주소를 만든다. 안내가 있으면 notice 쿼리를 붙인다. */
export const getTeamHomePath = (teamId: string | number, notice?: string) => {
  const path = `/teams/${encodeURIComponent(String(teamId))}`;

  return notice ? `${path}?notice=${encodeURIComponent(notice)}` : path;
};
