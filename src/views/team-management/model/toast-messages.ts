import type { AppToastVariant } from '@/shared/ui';

export interface ToastMessage {
  text: string;
  variant: AppToastVariant;
}

export const teamManagementToastMessages: Record<string, ToastMessage> = {
  inviteCodeRegenerateLimitExceeded: {
    text: '초대코드 재생성 횟수를 초과했습니다.',
    variant: 'danger',
  },
  teamNameUpdateSuccess: { text: '팀 이름이 변경되었습니다', variant: 'success' },
  teamNameUpdateFailure: {
    text: '팀 이름 변경에 실패했습니다. 다시 시도해주세요.',
    variant: 'danger',
  },
  inviteCodeRegenerateSuccess: {
    text: '초대 코드가 재생성되었습니다.',
    variant: 'success',
  },
  inviteCodeRegenerateFailure: {
    text: '초대 코드 재생성에 실패했습니다. 다시 시도해주세요.',
    variant: 'danger',
  },
  memberKickFailure: {
    text: '사용자 강퇴에 실패했습니다. 다시 시도해주세요.',
    variant: 'danger',
  },
  leaderDelegateSuccess: {
    text: '팀장 권한이 위임되었습니다.',
    variant: 'success',
  },
  leaderDelegateFailure: {
    text: '팀장 권한 부여에 실패했습니다. 다시 시도해주세요.',
    variant: 'danger',
  },
  teamLeaveSuccess: { text: '팀 나가기가 완료되었습니다.', variant: 'success' },
  teamLeaveFailure: {
    text: '팀 나가기에 실패했습니다. 다시 시도해주세요.',
    variant: 'danger',
  },
  teamDeleteBlockedByActiveMeeting: {
    text: '현재 진행 중인 회의가 있어 팀을 삭제할 수 없습니다.',
    variant: 'danger',
  },
  teamDeleteSuccess: { text: '팀 삭제가 완료되었습니다.', variant: 'success' },
  teamDeleteFailure: { text: '팀 삭제가 실패했습니다. 다시 시도해주세요.', variant: 'danger' },
  blockReleaseSuccess: {
    text: '차단이 해제되었습니다.',
    variant: 'success',
  },
  blockReleaseFailure: {
    text: '차단 해제에 실패했습니다. 다시 시도해주세요.',
    variant: 'danger',
  },
  participationRevoked: { text: '참여 권한이 해제되었습니다.', variant: 'neutral' },
  voiceProfileReenrollSuccess: { text: '음성 정보가 새로 등록되었습니다', variant: 'success' },
};

export const getMemberKickSuccessToast = (memberName: string): ToastMessage => ({
  text: `${memberName}님을 팀에서 내보냈습니다.`,
  variant: 'success',
});
