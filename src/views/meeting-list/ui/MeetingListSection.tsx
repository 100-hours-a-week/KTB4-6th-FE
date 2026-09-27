import { useState } from 'react';
import { MeetingApiError } from '@/features/meeting';
import { DeleteConfirmDialog, useAppToast } from '@/shared/ui';
import type { Meeting, TeamMemberRole } from '../model/type';
import { useDeleteMeeting } from '../model/useDeleteMeeting';
import { useRenameMeeting } from '../model/useRenameMeeting';
import { InProgressMeetingItem } from './InProgressMeetingItem';
import { MeetingItem } from './MeetingItem';
import { MeetingRenameDialog } from './MeetingRenameDialog';
import { MeetingListLoadMore } from './MeetingListLoadMore';

interface MeetingListSectionProps {
  meetings: Meeting[];
  teamId: number;
  viewerRole: TeamMemberRole;
  hasMore: boolean;
  loadMoreStatus: 'idle' | 'loading' | 'error';
  onLoadMore: () => void;
}

// 열려 있는 다이얼로그. 어떤 회의에 대해 어떤 종류가 열렸는지를 함께 담고, null이면 열린 것이 없다.
type MeetingDialog = {
  meeting: Meeting;
  type: 'rename' | 'delete';
} | null;

export const MeetingListSection = ({
  meetings,
  teamId,
  viewerRole,
  hasMore,
  loadMoreStatus,
  onLoadMore,
}: MeetingListSectionProps) => {
  const { showToast } = useAppToast();
  const { mutate: renameMeeting } = useRenameMeeting(teamId);
  const { mutate: deleteMeeting } = useDeleteMeeting(teamId);
  const [dialog, setDialog] = useState<MeetingDialog>(null);
  const isLeader = viewerRole === 'leader';

  const closeDialog = () => setDialog(null);

  const handleConfirmRename = (title: string) => {
    if (dialog?.type !== 'rename') return;

    const meetingId = dialog.meeting.id;
    closeDialog();
    renameMeeting(
      { meetingId, title },
      {
        onSuccess: () => showToast('회의 이름이 변경되었습니다', 'success'),
        onError: (error) =>
          showToast(
            error instanceof MeetingApiError ? error.message : '회의 이름 변경에 실패했습니다.',
            'danger',
          ),
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
      <section className="mt-6 flex flex-1 flex-col px-5 pb-8">
        <h2 className="text-base font-bold text-cool-900">전체 회의</h2>

        {meetings.length === 0 ? (
          <div className="motion-safe:animate-in motion-safe:fade-in motion-safe:animation-duration-300 mt-3 flex min-h-40 flex-col items-center justify-center rounded-2xl border border-dashed border-cool-200 bg-white px-4 text-center">
            <p className="text-sm font-semibold text-cool-700">전체 회의가 없어요.</p>
            <p className="mt-1 text-sm text-cool-500">새 회의를 만들어 시작해보세요.</p>
          </div>
        ) : (
          <>
            <div className="mt-3 flex flex-col gap-2.5">
              {meetings.map((meeting) => {
                // 팀장에게만 콜백을 넘기고, 팀원에게는 넘기지 않아 항목이 ⋯ 메뉴를 그리지 않는다.
                const menuActions = isLeader
                  ? {
                      onRename: () => setDialog({ meeting, type: 'rename' }),
                      onDelete: () => setDialog({ meeting, type: 'delete' }),
                    }
                  : {};

                return meeting.status === 'in_progress' ? (
                  <InProgressMeetingItem
                    key={meeting.id}
                    meeting={meeting}
                    teamId={teamId}
                    {...menuActions}
                  />
                ) : (
                  <MeetingItem
                    key={meeting.id}
                    meeting={meeting}
                    teamId={teamId}
                    {...menuActions}
                  />
                );
              })}
            </div>
            {meetings.length > 0 && (
              <MeetingListLoadMore
                hasMore={hasMore}
                status={loadMoreStatus}
                onLoadMore={onLoadMore}
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
