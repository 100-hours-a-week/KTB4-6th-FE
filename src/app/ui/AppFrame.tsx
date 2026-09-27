import type { ReactNode } from 'react';
import { RecordingBanner } from '@/widgets/recording-banner';

export function AppFrame({ children }: { children: ReactNode }) {
  return (
    <div
      id="app-frame"
      className="relative isolate mx-auto flex min-h-[844px] w-full max-w-[390px] flex-col bg-white"
    >
      <RecordingBanner />
      {children}
    </div>
  );
}
