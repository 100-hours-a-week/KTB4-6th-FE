'use client';

import type { FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Info } from 'lucide-react';
import { getNameError, NAME_MAX_LENGTH, useTeamSpaceOnboardingStore } from '@/features/team-space';
import { OnboardingActionButton } from './OnboardingActionButton';
import { OnboardingLayout } from './OnboardingLayout';
import { OnboardingTextField } from './OnboardingTextField';

interface TeamNameFormProps {
  errorMessage?: string;
  isSubmitting?: boolean;
  onChange: (value: string) => void;
  onSubmit: () => void | Promise<void>;
  value: string;
}

export const TeamNameForm = ({
  errorMessage,
  isSubmitting = false,
  onChange,
  onSubmit,
  value,
}: TeamNameFormProps) => {
  const validationError = getNameError(value, 'team');

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
        backHref="/?teamSpace=start"
        step={1}
        totalSteps={3}
        centered
        title="팀 이름을 입력해주세요"
        description="팀원들이 함께 쓰게 될 팀 스페이스의 이름입니다."
        action={
          <OnboardingActionButton
            type="submit"
            disabled={Boolean(validationError)}
            isLoading={isSubmitting}
          >
            확인
          </OnboardingActionButton>
        }
      >
        <OnboardingTextField
          id="team-name"
          value={value}
          label="팀 이름"
          maxLength={NAME_MAX_LENGTH}
          placeholder="팀명을 입력해주세요"
          helperText="2자 이상 10자 이하"
          errorMessage={errorMessage ?? validationError}
          onChange={onChange}
        />

        <div className="mt-5 flex gap-3 rounded-2xl bg-brand-50 px-4 py-4">
          <Info
            aria-hidden="true"
            className="mt-0.5 size-5 shrink-0 text-brand-600"
            strokeWidth={2}
          />
          <div className="text-xs leading-5">
            <p className="font-semibold text-cool-900">팀 스페이스를 생성하면 팀장이 됩니다.</p>
            <p className="mt-0.5 text-cool-500">
              팀장은 회의 이름 수정 및 회의 삭제를 할 수 있습니다.
            </p>
          </div>
        </div>
      </OnboardingLayout>
    </form>
  );
};

export const TeamNameScreen = () => {
  const router = useRouter();
  const teamName = useTeamSpaceOnboardingStore((state) => state.create.teamName);
  const setTeamName = useTeamSpaceOnboardingStore((state) => state.setTeamName);

  return (
    <TeamNameForm
      value={teamName}
      onChange={setTeamName}
      onSubmit={() => router.push('/teams/create/nickname')}
    />
  );
};
