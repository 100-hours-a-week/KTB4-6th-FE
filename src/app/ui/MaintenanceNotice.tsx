'use client';

import { useState, useSyncExternalStore } from 'react';
import Image from 'next/image';
import { Dialog } from '@base-ui/react/dialog';
import { useAppFrameElement } from '@/shared/lib';

const MAINTENANCE_START_AT = new Date('2026-10-25T14:00:00+09:00').getTime();
const MAINTENANCE_END_AT = new Date('2026-10-25T17:00:00+09:00').getTime();
const MAINTENANCE_PERIOD_LABEL = '10월 25일 (일) 14:00 ~ 17:00';
const DISMISSED_STORAGE_KEY = 'maintenance-notice-2026-10-25-dismissed';

type MaintenancePhase = 'upcoming' | 'ongoing' | 'ended';

const subscribeToClock = (onChange: () => void) => {
  const intervalId = window.setInterval(onChange, 30_000);
  return () => window.clearInterval(intervalId);
};

const getMaintenancePhase = (): MaintenancePhase => {
  const now = Date.now();

  if (now < MAINTENANCE_START_AT) return 'upcoming';
  if (now < MAINTENANCE_END_AT) return 'ongoing';
  return 'ended';
};

const readDismissed = () => {
  try {
    return typeof window !== 'undefined' && localStorage.getItem(DISMISSED_STORAGE_KEY) === '1';
  } catch {
    return false;
  }
};

const MaintenanceMascot = () => (
  <Image
    src="/brand/mascot/meety-09-maintenance-transparent.png"
    alt=""
    width={160}
    height={160}
    priority
    className="size-40"
  />
);

const MaintenancePeriod = () => (
  <p className="mt-5 rounded-xl bg-cool-50 px-4 py-3 text-sm font-semibold text-cool-900">
    {MAINTENANCE_PERIOD_LABEL}
  </p>
);

const MaintenanceScreen = () => (
  <div
    role="alert"
    className="absolute inset-0 z-[110] flex flex-col items-center justify-center bg-white px-6 text-center"
  >
    <MaintenanceMascot />
    <span className="mt-6 rounded-full bg-warning-bg px-4 py-1.5 text-sm font-semibold text-warning">
      서비스 점검 중
    </span>
    <h1 className="mt-4 text-2xl leading-snug font-bold tracking-tight text-cool-900">
      더 안정적인 Meety를 위해
      <br />
      잠시 점검하고 있어요
    </h1>
    <MaintenancePeriod />
    <p className="mt-4 text-sm leading-6 text-cool-600">
      점검이 끝나면 다시 이용할 수 있어요.
      <br />
      이용에 불편을 드려 죄송합니다.
    </p>
  </div>
);

const UpcomingMaintenanceDialog = ({ onClose }: { onClose: () => void }) => {
  const frame = useAppFrameElement();

  return (
    <Dialog.Root open onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal container={frame}>
        <Dialog.Backdrop className="absolute inset-0 z-[105] bg-cool-900/45" />
        <Dialog.Popup className="absolute inset-x-5 top-1/2 z-[106] flex -translate-y-1/2 flex-col items-center rounded-[28px] bg-white px-6 pt-8 pb-6 text-center shadow-[0_20px_48px_rgba(20,34,56,0.24)] outline-none">
          <MaintenanceMascot />
          <span className="mt-4 rounded-full bg-warning-bg px-4 py-1.5 text-sm font-semibold text-warning">
            서비스 점검 예정
          </span>
          <Dialog.Title className="mt-4 text-xl leading-snug font-bold tracking-tight text-cool-900">
            더 안정적인 Meety를 위해
            <br />
            서비스 점검을 진행해요
          </Dialog.Title>
          <MaintenancePeriod />
          <Dialog.Description className="mt-4 text-sm leading-6 text-cool-600">
            점검 시간에는 Meety를 이용할 수 없어요.
            <br />
            진행 중인 회의는 점검 전에 마무리해 주세요.
          </Dialog.Description>
          <Dialog.Close className="mt-6 h-12 w-full rounded-xl bg-brand-600 text-base font-semibold text-white transition-colors hover:bg-brand-700">
            확인
          </Dialog.Close>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export const MaintenanceNotice = () => {
  const phase = useSyncExternalStore(subscribeToClock, getMaintenancePhase, () => null);
  const [isDismissed, setIsDismissed] = useState(readDismissed);

  const dismiss = () => {
    setIsDismissed(true);
    try {
      localStorage.setItem(DISMISSED_STORAGE_KEY, '1');
    } catch {
      return;
    }
  };

  if (phase === 'ongoing') return <MaintenanceScreen />;
  if (phase === 'upcoming' && !isDismissed) return <UpcomingMaintenanceDialog onClose={dismiss} />;
  return null;
};
