'use client';

import type { FormEvent } from 'react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getInviteCodeError, INVITE_CODE_LENGTH } from '../model/validation';
import { OnboardingActionButton } from './OnboardingActionButton';
import { OnboardingLayout } from './OnboardingLayout';
import { OnboardingTextField } from './OnboardingTextField';

interface InviteCodeFormProps {
  errorMessage?: string;
  isSubmitting?: boolean;
  onChange: (value: string) => void;
  onSubmit: () => void | Promise<void>;
  value: string;
}

export const InviteCodeForm = ({
  errorMessage,
  isSubmitting = false,
  onChange,
  onSubmit,
  value,
}: InviteCodeFormProps) => {
  const validationError = getInviteCodeError(value);

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
        totalSteps={2}
        title="초대 코드를 입력해주세요"
        description="전달받은 8자리 코드로 팀 스페이스에 참여할 수 있어요."
        action={
          <OnboardingActionButton
            type="submit"
            disabled={Boolean(validationError)}
            isLoading={isSubmitting}
          >
            참여하기
          </OnboardingActionButton>
        }
      >
        <OnboardingTextField
          id="invite-code"
          value={value}
          maxLength={INVITE_CODE_LENGTH}
          autoCapitalize="characters"
          placeholder="8자리 초대 코드"
          helperText="영문과 숫자 8자리"
          errorMessage={errorMessage ?? validationError}
          onChange={onChange}
        />
      </OnboardingLayout>
    </form>
  );
};

export const InviteCodeScreen = () => {
  const router = useRouter();
  const [inviteCode, setInviteCode] = useState('');

  return (
    <InviteCodeForm
      value={inviteCode}
      onChange={setInviteCode}
      onSubmit={() => router.push('/team-space/join/nickname')}
    />
  );
};
