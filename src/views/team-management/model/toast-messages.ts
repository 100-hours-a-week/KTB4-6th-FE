import type { AppToastVariant } from '@/shared/ui';

export interface ToastMessage {
  text: string;
  variant: AppToastVariant;
}

// 확인된 토스트 문구 모음. 실제 노출 트리거는 서브 이슈 4(동작 연결)·5(데이터 연결)에서 연결한다.
// 초대 코드 복사 결과 문구는 entities/invite-code의 useCopyInviteCode가 직접 노출하므로 여기 두지 않는다.
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
  teamDeleteBlockedByActiveMeeting: {
    text: '현재 진행 중인 회의가 있어 팀을 삭제할 수 없습니다.',
    variant: 'danger',
  },
  teamDeleteFailure: { text: '팀 삭제가 실패했습니다. 다시 시도해주세요.', variant: 'danger' },
  blockReleaseFailure: {
    text: '차단 해제에 실패했습니다. 다시 시도해주세요.',
    variant: 'danger',
  },
  participationRevoked: { text: '참여 권한이 해제되었습니다.', variant: 'neutral' },
};

// 강퇴 성공 메시지는 대상자 이름이 들어가야 해서 함수로 제공한다.
export const getMemberKickSuccessToast = (memberName: string): ToastMessage => ({
  text: `${memberName}님을 팀에서 내보냈습니다.`,
  variant: 'success',
});
