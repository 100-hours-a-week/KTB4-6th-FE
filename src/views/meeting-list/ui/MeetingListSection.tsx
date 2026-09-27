import { useState } from 'react';
import { DeleteConfirmDialog, useAppToast } from '@/shared/ui';
import type { Meeting, TeamMemberRole } from '../model/type';
import { InProgressMeetingItem } from './InProgressMeetingItem';
import { MeetingItem } from './MeetingItem';
import { MeetingRenameDialog } from './MeetingRenameDialog';

interface MeetingListSectionProps {
  meetings: Meeting[];
  teamId: number;
  viewerRole: TeamMemberRole;
}

// 열려 있는 다이얼로그. 어떤 회의에 대해 어떤 종류가 열렸는지를 함께 담고, null이면 열린 것이 없다.
type MeetingDialog = {
  meeting: Meeting;
  type: 'rename' | 'delete';
} | null;

export const MeetingListSection = ({ meetings, teamId, viewerRole }: MeetingListSectionProps) => {
  const { showToast } = useAppToast();
  const [dialog, setDialog] = useState<MeetingDialog>(null);
  const isLeader = viewerRole === 'leader';

  const closeDialog = () => setDialog(null);

  // TODO: 회의 수정 API(PATCH /api/v1/meetings/{meetingId}) 연동 시 저장 요청으로 교체한다.
  const handleConfirmRename = () => {
    closeDialog();
    showToast('회의 이름이 변경되었습니다', 'success');
  };

  // TODO: 회의 삭제 API(DELETE /api/v1/meetings/{meetingId}) 연동 시 삭제 요청으로 교체한다.
  const handleConfirmDelete = () => {
    closeDialog();
    showToast('회의가 삭제되었습니다', 'success');
  };

  return (
    <>
      <section className="mt-6 flex flex-1 flex-col px-5 pb-8">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-cool-900">전체 회의</h2>
          <span className="text-sm text-cool-500">총 {meetings.length}건</span>
        </div>

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
                  <InProgressMeetingItem key={meeting.id} meeting={meeting} {...menuActions} />
                ) : (
                  <MeetingItem key={meeting.id} meeting={meeting} {...menuActions} />
                );
              })}
            </div>

            <button
              type="button"
              className="mt-4 flex h-11 items-center justify-center rounded-xl border border-cool-200 text-sm font-medium text-cool-600 transition-colors hover:bg-cool-50"
            >
              더보기
            </button>
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
