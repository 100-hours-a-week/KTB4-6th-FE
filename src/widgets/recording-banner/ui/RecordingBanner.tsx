'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMediaRecorder } from '@/features/recording';

const formatElapsed = (seconds: number) =>
  [Math.floor(seconds / 3600), Math.floor((seconds % 3600) / 60), seconds % 60]
    .map((part) => String(part).padStart(2, '0'))
    .join(':');

export function RecordingBanner() {
  const pathname = usePathname();
  const activeRecording = useMediaRecorder((state) => state.activeRecording);
  const recorderStatus = useMediaRecorder((state) => state.status);
  const operation = useMediaRecorder((state) => state.operation);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!activeRecording) return;

    const interval = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(interval);
  }, [activeRecording]);

  if (!activeRecording) return null;

  const href = `/teams/${encodeURIComponent(activeRecording.teamId)}/meetings/${activeRecording.meetingId}`;
  if (pathname === href) return null;

  const elapsedSeconds = Math.max(0, Math.floor((now - activeRecording.startedAt) / 1000));
  const statusLabel =
    operation === 'finishing'
      ? '회의 종료 중'
      : recorderStatus === 'paused'
        ? '녹음 일시정지'
        : recorderStatus === 'idle'
          ? '녹음 연결 끊김'
          : '회의 진행 중';

  return (
    <div className="flex min-h-10 shrink-0 items-center justify-between gap-3 bg-danger px-5 text-xs font-medium text-white">
      <div className="flex min-w-0 items-center gap-2">
        <span aria-hidden="true" className="size-1.5 shrink-0 rounded-full bg-white/65" />
        <span className="whitespace-nowrap">{statusLabel}</span>
        <span className="font-mono font-semibold tabular-nums">
          {formatElapsed(elapsedSeconds)}
        </span>
      </div>
      <Link href={href} className="shrink-0 rounded py-2 text-white hover:underline">
        돌아가기 ›
      </Link>
    </div>
  );
}
