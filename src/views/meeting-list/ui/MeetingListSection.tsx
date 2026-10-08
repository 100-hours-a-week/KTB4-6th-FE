import { useState, type RefObject } from 'react';
import { cn } from '@/shared/lib';
import { DeleteConfirmDialog, useAppToast } from '@/shared/ui';
import { getMeetingMenuState } from '../model/get-meeting-menu-state';
import type {
  Meeting,
  MeetingDateGroup,
  MeetingMenuActions,
  MeetingSearchResultsData,
  TeamMemberRole,
  TodayMeetings,
} from '../model/type';
import { useDeleteMeeting } from '../model/useDeleteMeeting';
import { useRenameMeeting } from '../model/useRenameMeeting';
import { MeetingDateSection } from './MeetingDateSection';
import { MeetingInfoEditDialog } from './MeetingInfoEditDialog';
import { MeetingRenameDialog } from './MeetingRenameDialog';
import { MeetingListLoadMore } from './MeetingListLoadMore';
import { MeetingSearchResults } from './MeetingSearchResults';
import { MeetingTimelineItem } from './MeetingTimelineItem';
import { TodayMeetingSection } from './TodayMeetingSection';

interface MeetingListSectionProps {
  today: TodayMeetings | null;
  groups: MeetingDateGroup[];
  teamId: number;
  viewerRole: TeamMemberRole;
  viewerTeamMemberId: number | null;
  hasMore: boolean;
  loadMoreStatus: 'idle' | 'loading' | 'error';
  onLoadMore: () => void;
  scrollRootRef: RefObject<HTMLDivElement | null>;
  searchResults: MeetingSearchResultsData | null;
  className?: string;
}

type MeetingDialog = {
  meeting: Meeting;
  type: 'editInfo' | 'rename' | 'delete';
} | null;

export const MeetingListSection = ({
  today,
  groups,
  teamId,
  viewerRole,
  viewerTeamMemberId,
  hasMore,
  loadMoreStatus,
  onLoadMore,
  scrollRootRef,
  searchResults,
  className,
}: MeetingListSectionProps) => {
  const { showToast } = useAppToast();
  const { mutate: renameMeeting } = useRenameMeeting(teamId);
  const { mutate: deleteMeeting } = useDeleteMeeting(teamId);
  const [dialog, setDialog] = useState<MeetingDialog>(null);

  const closeDialog = () => setDialog(null);

  const getMenuActions = (meeting: Meeting): MeetingMenuActions => ({
    state: getMeetingMenuState({ meeting, viewerRole, viewerTeamMemberId }),
    onRename: () => setDialog({ meeting, type: 'rename' }),
    onEditInfo: () => setDialog({ meeting, type: 'editInfo' }),
    onDelete: () => setDialog({ meeting, type: 'delete' }),
  });

  const handleConfirmRename = (title: string) => {
    if (dialog?.type !== 'rename') return;

    const meetingId = dialog.meeting.id;
    closeDialog();
    renameMeeting(
      { meetingId, title },
      {
        onSuccess: () => showToast('회의 이름이 변경되었습니다', 'success'),
        onError: () => showToast('회의 이름 변경에 실패했습니다. 다시 시도해주세요.', 'danger'),
      },
    );
  };

  const handleConfirmDelete = () => {
    if (dialog?.type !== 'delete') return;

    const { meeting } = dialog;
    closeDialog();
    deleteMeeting(meeting.id, {
      onSuccess: () => showToast('회의가 삭제되었습니다', 'success'),
      onError: () => showToast('회의 삭제에 실패했습니다. 다시 시도해주세요.', 'danger'),
    });
  };

  return (
    <>
      <section className={cn('mt-6 flex flex-1 flex-col px-5 pb-8', className)}>
        {searchResults ? (
          <MeetingSearchResults
            results={searchResults}
            teamId={teamId}
            getMenuActions={getMenuActions}
            scrollRootRef={scrollRootRef}
          />
        ) : (
          <>
            <h2 className="text-base font-bold text-cool-900">전체 회의</h2>

            {today && (
              <div className="mt-3">
                <TodayMeetingSection
                  today={today}
                  teamId={teamId}
                  getMenuActions={getMenuActions}
                />
              </div>
            )}

            {groups.length > 0 && (
              <>
                <div className="mt-6 flex items-center gap-2">
                  <span className="text-[13px] font-medium text-cool-500">날짜별 회의</span>
                  <span aria-hidden="true" className="h-px flex-1 bg-cool-200" />
                </div>
                <div className="mt-4 flex flex-col gap-10">
                  {groups.map((group) => (
                    <MeetingDateSection
                      key={group.date}
                      label={group.label}
                      meetingCount={group.meetingCount}
                    >
                      {group.meetings.map((meeting) => (
                        <MeetingTimelineItem
                          key={meeting.id}
                          meeting={meeting}
                          teamId={teamId}
                          menuActions={getMenuActions(meeting)}
                        />
                      ))}
                    </MeetingDateSection>
                  ))}
                </div>
              </>
            )}

            {(groups.length > 0 || hasMore) && (
              <MeetingListLoadMore
                hasMore={hasMore}
                status={loadMoreStatus}
                onLoadMore={onLoadMore}
                scrollRootRef={scrollRootRef}
              />
            )}
          </>
        )}
      </section>

      {dialog?.type === 'rename' && (
        <MeetingRenameDialog
          currentTitle={dialog.meeting.title}
          onConfirm={handleConfirmRename}
          onClose={closeDialog}
        />
      )}
      {dialog?.type === 'editInfo' && (
        <MeetingInfoEditDialog
          meetingId={dialog.meeting.id}
          teamId={teamId}
          onClose={closeDialog}
        />
      )}
      {dialog?.type === 'delete' && (
        <DeleteConfirmDialog
          title="회의 내용을 삭제하시겠어요?"
          description={`${dialog.meeting.title}의 녹음, 전사, 요약 내용이 모두 삭제되며 복구할 수 없습니다.`}
          onConfirm={handleConfirmDelete}
          onClose={closeDialog}
        />
      )}
    </>
  );
};
