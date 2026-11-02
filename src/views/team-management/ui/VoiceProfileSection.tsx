'use client';

import { Menu } from '@base-ui/react/menu';
import { Mic, MoreVertical } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useHome } from '@/features/home';
import { useAppFrameElement } from '@/shared/lib';
import { useAppToast } from '@/shared/ui';
import { VoiceEnrollSheet } from '@/widgets/voice-enroll-sheet';
import { teamManagementToastMessages } from '../model/toast-messages';

interface VoiceProfileSectionProps {
  teamId: number;
}

export const VoiceProfileSection = ({ teamId }: VoiceProfileSectionProps) => {
  const router = useRouter();
  const frame = useAppFrameElement();
  const [isEnrollSheetOpen, setIsEnrollSheetOpen] = useState(false);
  const { showToast } = useAppToast();
  const { data: home, isError, isFetching, refetch } = useHome({ isEnabled: true });
  const hasCurrentHome = home?.team.teamId === teamId;
  const hasVoiceConsent = hasCurrentHome && home.hasVoiceConsent;
  const isConsentStatusReady = hasCurrentHome && !isError;

  const handleDone = () => {
    setIsEnrollSheetOpen(false);
    const { text, variant } = teamManagementToastMessages.voiceProfileReenrollSuccess;
    showToast(text, variant);
  };

  return (
    <section className="px-5 pt-5">
      <div className="flex items-center gap-3 rounded-xl border border-cool-100 bg-white p-3.5">
        <span
          aria-hidden="true"
          className="flex size-10 shrink-0 items-center justify-center rounded-[11px] bg-brand-100 text-brand-600"
        >
          <Mic className="size-[19px]" strokeWidth={1.6} />
        </span>
        <h2 className="min-w-0 flex-1 text-[14.5px] leading-[1.3] font-semibold tracking-[-0.015em] text-cool-900">
          내 음성 정보
        </h2>
        <button
          type="button"
          onClick={() => setIsEnrollSheetOpen(true)}
          disabled={!isConsentStatusReady || !hasVoiceConsent}
          className="min-h-10 shrink-0 rounded-lg border border-cool-300 bg-white px-3 text-xs font-semibold text-cool-600 transition-colors hover:border-cool-500 hover:bg-cool-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          다시 등록
        </button>
        <Menu.Root>
          <Menu.Trigger
            aria-label="내 음성 정보 더보기"
            disabled={!isConsentStatusReady}
            className="flex size-9 shrink-0 items-center justify-center rounded-full text-cool-600 hover:bg-cool-50 disabled:opacity-40"
          >
            <MoreVertical className="size-5" />
          </Menu.Trigger>
          <Menu.Portal container={frame}>
            <Menu.Positioner
              className="z-[75] outline-none"
              side="bottom"
              align="end"
              sideOffset={4}
            >
              <Menu.Popup className="min-w-[172px] rounded-xl border border-cool-100 bg-white py-1 shadow-[0_8px_24px_rgba(20,34,56,0.12)] outline-none">
                <Menu.Item
                  onClick={() =>
                    router.push(
                      `/teams/${teamId}/voice-consent${hasVoiceConsent ? '?view=full' : ''}`,
                    )
                  }
                  className="px-3 py-2.5 text-sm font-medium text-cool-700 outline-none select-none data-highlighted:bg-cool-50"
                >
                  {hasVoiceConsent ? '동의 내용 보기' : '음성 수집 동의하기'}
                </Menu.Item>
              </Menu.Popup>
            </Menu.Positioner>
          </Menu.Portal>
        </Menu.Root>
      </div>

      {isError && !isFetching && (
        <button
          type="button"
          onClick={() => void refetch()}
          className="mt-2 text-sm font-medium text-brand-600"
        >
          음성 정보 상태를 불러오지 못했어요. 다시 시도
        </button>
      )}

      <VoiceEnrollSheet
        isOpen={isEnrollSheetOpen}
        mode="edit"
        consentHref={`/teams/${teamId}/voice-consent`}
        onDone={handleDone}
        onClose={() => setIsEnrollSheetOpen(false)}
      />
    </section>
  );
};
