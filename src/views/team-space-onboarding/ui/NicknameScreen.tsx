'use client';

import type { FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { getNameError, NAME_MAX_LENGTH } from '../model/validation';
import { OnboardingActionButton } from './OnboardingActionButton';
import { OnboardingLayout } from './OnboardingLayout';
import { OnboardingTextField } from './OnboardingTextField';
import { useTeamSpaceOnboardingStore } from '../model/useTeamSpaceOnboardingStore';

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
        backHref={isCreateFlow ? '/team-space/create' : '/team-space/join'}
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
          errorMessage={errorMessage ?? validationError}
          onChange={onChange}
        />
      </OnboardingLayout>
    </form>
  );
};

interface NicknameScreenProps {
  flow: OnboardingFlow;
  onComplete?: (nickname: string) => void | Promise<void>;
}

export const NicknameScreen = ({ flow, onComplete }: NicknameScreenProps) => {
  const router = useRouter();
  const nickname = useTeamSpaceOnboardingStore((state) =>
    flow === 'join' ? state.join.nickname : state.create.nickname,
  );

  const setNickname = useTeamSpaceOnboardingStore((state) =>
    flow === 'join' ? state.setJoinNickname : state.setCreateNickname,
  );

  const handleSubmit = async () => {
    await onComplete?.(nickname);

    if (flow === 'create') {
      router.push('/team-space/create/invite');
    }
  };

  return (
    <NicknameForm flow={flow} value={nickname} onChange={setNickname} onSubmit={handleSubmit} />
  );
};
