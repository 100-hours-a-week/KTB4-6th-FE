'use client';

import type { FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import {
  getNameError,
  NAME_MAX_LENGTH,
  useCreateTeamSpace,
  useJoinTeamSpace,
  useTeamSpaceOnboardingStore,
} from '@/features/team-space';
import { OnboardingActionButton } from './OnboardingActionButton';
import { OnboardingLayout } from './OnboardingLayout';
import { OnboardingTextField } from './OnboardingTextField';

export type OnboardingFlow = 'join' | 'create';

interface NicknameFormProps {
  errorMessage?: string;
  flow: OnboardingFlow;
  isSubmitting?: boolean;
  onChange: (value: string) => void;
  onSubmit: () => void | Promise<void>;
  value: string;
}

export const NicknameForm = ({
  errorMessage,
  flow,
  isSubmitting = false,
  onChange,
  onSubmit,
  value,
}: NicknameFormProps) => {
  const validationError = getNameError(value, 'nickname');
  const isCreateFlow = flow === 'create';

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (validationError || isSubmitting) {
      return;
    }

    void onSubmit();
  };

  return (
    <form className="contents" noValidate onSubmit={handleSubmit}>
      <OnboardingLayout
        backHref={isCreateFlow ? '/teams/create' : '/teams/join'}
        step={2}
        totalSteps={isCreateFlow ? 3 : 2}
        title="이름을 설정해주세요"
        description={
          isCreateFlow
            ? '생성한 팀 스페이스에서 사용할 이름을 입력해주세요.'
            : '참여할 팀 스페이스에서 사용할 이름을 입력해주세요.'
        }
        action={
          <OnboardingActionButton
            type="submit"
            disabled={Boolean(validationError)}
            isLoading={isSubmitting}
          >
            이 이름으로 설정
          </OnboardingActionButton>
        }
      >
        <OnboardingTextField
          id="nickname"
          value={value}
          maxLength={NAME_MAX_LENGTH}
          placeholder="이름을 입력해주세요"
          helperText="2자 이상 10자 이하"
          errorMessage={validationError}
          submitError={errorMessage}
          onChange={onChange}
        />
      </OnboardingLayout>
    </form>
  );
};

interface NicknameScreenProps {
  flow: OnboardingFlow;
}

export const NicknameScreen = ({ flow }: NicknameScreenProps) => {
  const router = useRouter();
  const nickname = useTeamSpaceOnboardingStore((state) =>
    flow === 'join' ? state.join.nickname : state.create.nickname,
  );

  const setNickname = useTeamSpaceOnboardingStore((state) =>
    flow === 'join' ? state.setJoinNickname : state.setCreateNickname,
  );
  const teamName = useTeamSpaceOnboardingStore((state) => state.create.teamName);
  const inviteCode = useTeamSpaceOnboardingStore((state) => state.join.inviteCode);
  const resetJoin = useTeamSpaceOnboardingStore((state) => state.resetJoin);
  const { isCreating, createError, createTeamSpace, clearCreateError } = useCreateTeamSpace();
  const { isJoining, joinError, joinTeamSpace, clearJoinError } = useJoinTeamSpace();

  const isSubmitting = flow === 'create' ? isCreating : isJoining;
  const submitError = flow === 'create' ? createError : joinError;

  const handleChange = (value: string) => {
    clearCreateError();
    clearJoinError();
    setNickname(value);
  };

  const handleSubmit = async () => {
    if (flow === 'create') {
      const isCreated = await createTeamSpace(teamName, nickname);

      if (isCreated) {
        router.push('/teams/create/invite');
      }

      return;
    }

    const teamId = await joinTeamSpace(inviteCode, nickname);

    if (teamId !== null) {
      router.push(`/teams/${teamId}`);
      resetJoin();
    }
  };

  return (
    <NicknameForm
      flow={flow}
      value={nickname}
      errorMessage={submitError ?? undefined}
      isSubmitting={isSubmitting}
      onChange={handleChange}
      onSubmit={handleSubmit}
    />
  );
};
