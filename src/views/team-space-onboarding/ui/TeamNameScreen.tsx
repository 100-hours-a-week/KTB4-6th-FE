'use client';

import type { FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { getNameError, NAME_MAX_LENGTH } from '../model/validation';
import { OnboardingActionButton } from './OnboardingActionButton';
import { OnboardingLayout } from './OnboardingLayout';
import { OnboardingTextField } from './OnboardingTextField';
import { useTeamSpaceOnboardingStore } from '../model/useTeamSpaceOnboardingStore';

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
        title={
          <>
            생성할 팀 이름을
            <br />
            입력해주세요
          </>
        }
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
        <div className="mb-7 rounded-2xl border border-brand-100 bg-brand-50 px-4 py-4 text-sm leading-6 text-cool-600">
          <p className="flex gap-3">
            <span aria-hidden="true" className="text-brand-400">
              ·
            </span>
            팀 스페이스를 생성하면 팀장이 됩니다.
          </p>
          <p className="mt-1 flex gap-3">
            <span aria-hidden="true" className="text-brand-400">
              ·
            </span>
            팀장은 회의 이름 수정 및 회의 삭제를 할 수 있습니다.
          </p>
        </div>

        <OnboardingTextField
          id="team-name"
          value={value}
          maxLength={NAME_MAX_LENGTH}
          placeholder="팀명을 입력해주세요"
          helperText="2자 이상 10자 이하"
          errorMessage={errorMessage ?? validationError}
          onChange={onChange}
        />
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
      onSubmit={() => router.push('/team-space/create/nickname')}
    />
  );
};
