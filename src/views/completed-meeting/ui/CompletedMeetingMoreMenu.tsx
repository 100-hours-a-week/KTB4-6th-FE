'use client';

import { useState, type ReactNode } from 'react';
import { Menu } from '@base-ui/react/menu';
import { FileText, Headphones, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { cn, useAppFrameElement } from '@/shared/lib';
import { useAppToast } from '@/shared/ui';
import type { CompletedMeetingViewerRole } from '../model/preview-completed-meeting';
import { MeetingRenameDialog } from './MeetingRenameDialog';

interface CompletedMeetingMoreMenuProps {
  meetingTitle: string;
  viewerRole: CompletedMeetingViewerRole;
  /** 음성 파일이 만료되기까지 남은 일수. 이미 만료됐으면 null */
  audioRemainingDays: number | null;
}

interface MoreMenuItemProps {
  icon: ReactNode;
  label: string;
  isDanger?: boolean;
  trailingText?: string;
  onClick?: () => void;
}

const MoreMenuItem = ({ icon, label, isDanger, trailingText, onClick }: MoreMenuItemProps) => (
  <Menu.Item
    onClick={onClick}
    className={cn(
      'flex min-h-12 items-center gap-3 border-t border-cool-100 px-4 py-3 text-sm font-medium outline-none select-none first:border-t-0',
      isDanger ? 'text-danger' : 'text-cool-900',
    )}
  >
    <span aria-hidden="true" className={cn('shrink-0', isDanger ? 'text-danger' : 'text-cool-500')}>
      {icon}
    </span>
    {label}
    {trailingText && (
      <span className="ml-auto text-xs font-normal text-cool-500">{trailingText}</span>
    )}
  </Menu.Item>
);

// TODO: 음성 삭제·회의 삭제는 각 모달과 연결하고, 다운로드는 API 연동 때 구현한다.
export const CompletedMeetingMoreMenu = ({
  meetingTitle,
  viewerRole,
  audioRemainingDays,
}: CompletedMeetingMoreMenuProps) => {
  const frame = useAppFrameElement();
  const { showToast } = useAppToast();
  const [isRenameOpen, setIsRenameOpen] = useState(false);
  const isLeader = viewerRole === 'leader';
  const isAudioExpired = audioRemainingDays === null;

  // TODO: 회의 수정 API(PATCH /api/v1/meetings/{meetingId}) 연동 시 저장 요청으로 교체한다.
  const handleConfirmRename = () => {
    setIsRenameOpen(false);
    showToast('회의 이름이 변경되었습니다', 'success');
  };

  const handleDownloadAudio = () => {
    if (isAudioExpired) showToast('만료된 음성 파일은 다운로드할 수 없습니다.', 'danger');
  };

  return (
    <>
      <Menu.Root>
        <Menu.Trigger
          aria-label="더 보기"
          className="flex size-9 items-center justify-center rounded-full text-cool-600 transition-colors hover:bg-cool-100"
        >
          <MoreVertical className="size-5" strokeWidth={2} />
        </Menu.Trigger>
        <Menu.Portal container={frame}>
          <Menu.Positioner className="z-[75] outline-none" side="bottom" align="end" sideOffset={6}>
            <Menu.Popup className="min-w-[220px] rounded-xl border border-cool-100 bg-white shadow-[0_8px_24px_rgba(20,34,56,0.12)] outline-none">
              {isLeader && (
                <MoreMenuItem
                  icon={<Pencil className="size-4" strokeWidth={2} />}
                  label="회의 이름 변경"
                  onClick={() => setIsRenameOpen(true)}
                />
              )}
              <MoreMenuItem
                icon={<Headphones className="size-4" strokeWidth={2} />}
                label="음성 다운로드"
                onClick={handleDownloadAudio}
              />
              <MoreMenuItem
                icon={<FileText className="size-4" strokeWidth={2} />}
                label="전사 다운로드"
              />
              <MoreMenuItem
                icon={<FileText className="size-4" strokeWidth={2} />}
                label="요약 다운로드"
              />
              {isLeader && (
                <>
                  {audioRemainingDays !== null && (
                    <MoreMenuItem
                      icon={<Trash2 className="size-4" strokeWidth={2} />}
                      label="음성 삭제"
                      isDanger
                      trailingText={`${audioRemainingDays}일 남음`}
                    />
                  )}
                  <MoreMenuItem
                    icon={<Trash2 className="size-4" strokeWidth={2} />}
                    label="회의 삭제"
                    isDanger
                  />
                </>
              )}
            </Menu.Popup>
          </Menu.Positioner>
        </Menu.Portal>
      </Menu.Root>
      {isRenameOpen && (
        <MeetingRenameDialog
          currentTitle={meetingTitle}
          onConfirm={handleConfirmRename}
          onClose={() => setIsRenameOpen(false)}
        />
      )}
    </>
  );
};
