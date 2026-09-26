interface MeetingListPageProps {
  teamId: number;
}

export const MeetingListPage = ({ teamId }: MeetingListPageProps) => {
  return (
    <div className="flex min-h-[844px] flex-1 flex-col bg-cool-50">
      <h1>회의 목록 (팀 {teamId})</h1>
    </div>
  );
};
