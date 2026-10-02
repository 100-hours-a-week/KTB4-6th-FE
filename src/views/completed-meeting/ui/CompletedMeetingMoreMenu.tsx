'use client';

import { useState, type ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Menu } from '@base-ui/react/menu';
import { FileText, Headphones, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import {
  getMeetingSummary,
  getMeetingTranscript,
  MeetingApiError,
  meetingKeys,
  useAudioDownloadUrl,
  useDeleteAudioFile,
} from '@/features/meeting';
import { cn, downloadFile, downloadTextFile, useAppFrameElement } from '@/shared/lib';
import { DeleteConfirmDialog, useAppToast } from '@/shared/ui';
import { formatTimestamp } from '../model/format-timestamp';
import { mapTranscriptSegments } from '../model/map-transcript-segments';
import { useMeetingDelete } from '../model/useMeetingDelete';
import { useMeetingRename } from '../model/useMeetingRename';
import type { CompletedMeetingViewerRole } from '../model/preview-completed-meeting';
import type { AudioViewState } from '../model/useAudioViewState';
import { MeetingRenameDialog } from './MeetingRenameDialog';

interface CompletedMeetingMoreMenuProps {
  teamId: string;
  meetingId: number;
  meetingTitle: string;
  viewerRole: CompletedMeetingViewerRole;
  audio: AudioViewState;
}

type MoreMenuDialog = 'rename' | 'audio-delete' | 'meeting-delete';

interface MoreMenuItemProps {
  icon: ReactNode;
  label: string;
  isDanger?: boolean;
  isDisabled?: boolean;
  trailingText?: string;
  onClick?: () => void;
}

const MoreMenuItem = ({
  icon,
  label,
  isDanger,
  isDisabled,
  trailingText,
  onClick,
}: MoreMenuItemProps) => (
  <Menu.Item
    onClick={onClick}
    disabled={isDisabled}
    className={cn(
      'flex min-h-12 items-center gap-3 border-t border-cool-100 px-4 py-3 text-sm font-medium outline-none select-none first:border-t-0',
      isDisabled ? 'text-cool-400' : isDanger ? 'text-danger' : 'text-cool-900',
    )}
  >
    <span
      aria-hidden="true"
      className={cn(
        'shrink-0',
        isDisabled ? 'text-cool-300' : isDanger ? 'text-danger' : 'text-cool-500',
      )}
    >
      {icon}
    </span>
    {label}
    {trailingText && (
      <span className="ml-auto text-xs font-normal text-cool-500">{trailingText}</span>
    )}
  </Menu.Item>
);

const getDownloadFilename = (meetingTitle: string, contentType: string, extension: string) => {
  const safeTitle = meetingTitle.trim().replace(/[\\/:*?"<>|]/g, '_') || '회의';
  return `${safeTitle}-${contentType}.${extension}`;
};

export const CompletedMeetingMoreMenu = ({
  teamId,
  meetingId,
  meetingTitle,
  viewerRole,
  audio,
}: CompletedMeetingMoreMenuProps) => {
  const frame = useAppFrameElement();
  const queryClient = useQueryClient();
  const { showToast } = useAppToast();
  const { rename } = useMeetingRename({ meetingId });
  const { mutate: deleteAudio } = useDeleteAudioFile();
  const { requestDelete } = useMeetingDelete({ teamId, meetingId });
  const [openDialog, setOpenDialog] = useState<MoreMenuDialog | null>(null);
  const [downloadingText, setDownloadingText] = useState<'transcript' | 'summary' | null>(null);
  const isLeader = viewerRole === 'leader';
  const isAudioExpired = audio.kind === 'expired';
  const audioFileId = audio.kind === 'available' ? audio.audioFileId : null;
  const { data: audioDownload } = useAudioDownloadUrl(audioFileId ?? undefined, {
    isEnabled: audioFileId !== null,
  });

  const closeDialog = () => setOpenDialog(null);

  const handleConfirmRename = (title: string) => {
    closeDialog();
    rename(title);
  };

  const handleConfirmAudioDelete = () => {
    closeDialog();
    if (audio.kind !== 'available' || audio.audioFileId === null) return;

    deleteAudio(audio.audioFileId, {
      onSuccess: () => {
        // 삭제는 비동기로 처리되므로, 다시 조회해 상태(삭제 중/만료)를 반영한다.
        void queryClient.invalidateQueries({ queryKey: meetingKeys.audioFile(meetingId) });
        showToast('음성 파일 삭제를 요청했습니다', 'success');
      },
      onError: (error) =>
        showToast(
          error instanceof MeetingApiError ? error.message : '음성 파일 삭제에 실패했습니다.',
          'danger',
        ),
    });
  };

  const handleConfirmMeetingDelete = () => {
    closeDialog();
    void requestDelete();
  };

  const handleDownloadAudio = () => {
    if (isAudioExpired) {
      showToast('만료된 음성 파일은 다운로드할 수 없습니다.', 'danger');
      return;
    }
    if (!audioDownload) {
      showToast('음성 파일 주소를 아직 받지 못했습니다. 잠시 후 다시 시도해주세요.', 'danger');
      return;
    }

    downloadFile(audioDownload.downloadUrl, `${meetingTitle}-음성.mp4`);
  };

  const handleDownloadTranscript = async () => {
    setDownloadingText('transcript');

    try {
      const segments = await queryClient.fetchQuery({
        queryKey: meetingKeys.transcript(meetingId),
        queryFn: () => getMeetingTranscript(meetingId),
      });
      const entries = mapTranscriptSegments(segments);

      if (entries.length === 0) {
        showToast('다운로드할 전사가 없습니다.', 'info');
        return;
      }

      const content = entries
        .map(
          (entry) =>
            `[${formatTimestamp(Math.floor(entry.startedAtMs / 1000))}] ${entry.speakerName}\n${entry.text}`,
        )
        .join('\n\n');

      downloadTextFile(content, getDownloadFilename(meetingTitle, '전사', 'txt'));
      showToast('전사 파일을 다운로드했습니다.', 'success');
    } catch (error) {
      showToast(
        error instanceof MeetingApiError ? error.message : '전사 다운로드에 실패했습니다.',
        'danger',
      );
    } finally {
      setDownloadingText(null);
    }
  };

  const handleDownloadSummary = async () => {
    setDownloadingText('summary');

    try {
      const summary = await queryClient.fetchQuery({
        queryKey: meetingKeys.summary(meetingId),
        queryFn: () => getMeetingSummary(meetingId),
      });
      const content = summary?.content?.trim();

      if (!content) {
        showToast('다운로드할 요약이 없습니다.', 'info');
        return;
      }

      downloadTextFile(
        content,
        getDownloadFilename(meetingTitle, '요약', 'md'),
        'text/markdown;charset=utf-8',
      );
      showToast('요약 파일을 다운로드했습니다.', 'success');
    } catch (error) {
      showToast(
        error instanceof MeetingApiError ? error.message : '요약 다운로드에 실패했습니다.',
        'danger',
      );
    } finally {
      setDownloadingText(null);
    }
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
                  onClick={() => setOpenDialog('rename')}
                />
              )}
              <MoreMenuItem
                icon={<Headphones className="size-4" strokeWidth={2} />}
                label="음성 다운로드"
                onClick={handleDownloadAudio}
              />
              <MoreMenuItem
                icon={<FileText className="size-4" strokeWidth={2} />}
                label={downloadingText === 'transcript' ? '전사 다운로드 중...' : '전사 다운로드'}
                isDisabled={downloadingText !== null}
                onClick={() => void handleDownloadTranscript()}
              />
              <MoreMenuItem
                icon={<FileText className="size-4" strokeWidth={2} />}
                label={downloadingText === 'summary' ? '요약 다운로드 중...' : '요약 다운로드'}
                isDisabled={downloadingText !== null}
                onClick={() => void handleDownloadSummary()}
              />
              {isLeader && (
                <>
                  {audio.kind === 'available' && (
                    <MoreMenuItem
                      icon={<Trash2 className="size-4" strokeWidth={2} />}
                      label="음성 삭제"
                      isDanger
                      onClick={() => setOpenDialog('audio-delete')}
                      trailingText={`${audio.remainingDays}일 남음`}
                    />
                  )}
                  <MoreMenuItem
                    icon={<Trash2 className="size-4" strokeWidth={2} />}
                    label="회의 삭제"
                    isDanger
                    onClick={() => setOpenDialog('meeting-delete')}
                  />
                </>
              )}
            </Menu.Popup>
          </Menu.Positioner>
        </Menu.Portal>
      </Menu.Root>
      {openDialog === 'rename' && (
        <MeetingRenameDialog
          currentTitle={meetingTitle}
          onConfirm={handleConfirmRename}
          onClose={closeDialog}
        />
      )}
      {openDialog === 'audio-delete' && (
        <DeleteConfirmDialog
          title="음성 파일을 삭제하시겠어요?"
          description="삭제한 음성 파일은 복구할 수 없어요. 전사·요약 내용은 그대로 유지돼요."
          onConfirm={handleConfirmAudioDelete}
          onClose={closeDialog}
        />
      )}
      {openDialog === 'meeting-delete' && (
        <DeleteConfirmDialog
          title="회의 내용을 삭제하시겠어요?"
          description="삭제한 회의 내용은 복구할 수 없습니다. 녹음, 전사, 요약이 모두 함께 삭제됩니다."
          onConfirm={handleConfirmMeetingDelete}
          onClose={closeDialog}
        />
      )}
    </>
  );
};
