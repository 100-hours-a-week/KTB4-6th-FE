import type { ReactNode } from 'react';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { cn } from '@/shared/lib';

interface OnboardingLayoutProps {
  action: ReactNode;
  backHref?: string;
  /** 진행 바 아래, 제목 위에 오는 부가 배지 (예: 완료 상태 표시). */
  badge?: ReactNode;
  /** 배지·제목·설명을 가운데 정렬할지. 입력 화면은 왼쪽, 완료 화면 등은 가운데. */
  centered?: boolean;
  children: ReactNode;
  description?: ReactNode;
  step?: number;
  title: ReactNode;
  totalSteps?: number;
  /** 본문 블록을 상단 바와 하단 액션 버튼 사이 중앙으로 내릴지. 완료 화면처럼 내용이 적을 때만 사용. */
  verticallyCentered?: boolean;
}

const StepProgressBar = ({ step, totalSteps }: { step: number; totalSteps: number }) => (
  <div className="flex flex-1 items-center gap-3">
    <div className="flex flex-1 gap-1.5">
      {Array.from({ length: totalSteps }, (_, index) => (
        <span
          key={index}
          className={cn('h-1.5 flex-1 rounded-full', index < step ? 'bg-brand-900' : 'bg-cool-200')}
        />
      ))}
    </div>
    <span className="shrink-0 font-mono text-sm text-cool-500 tabular-nums">
      {step}/{totalSteps}
    </span>
  </div>
);

export const OnboardingLayout = ({
  action,
  backHref,
  badge,
  centered = false,
  children,
  description,
  step,
  title,
  totalSteps,
  verticallyCentered = false,
}: OnboardingLayoutProps) => (
  <main className="flex min-h-[844px] flex-1 flex-col bg-white px-7 pt-14 pb-9">
    <div className="flex items-center gap-2">
      {backHref ? (
        <Link
          href={backHref}
          aria-label="이전 화면으로 이동"
          className="-ml-2 flex size-10 shrink-0 items-center justify-center rounded-full text-cool-900 transition-colors hover:bg-cool-50 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-brand-300"
        >
          <ChevronLeft className="size-6" strokeWidth={2} />
        </Link>
      ) : null}

      {step && totalSteps ? (
        <StepProgressBar step={step} totalSteps={totalSteps} />
      ) : !backHref ? (
        <div className="h-10" />
      ) : null}
    </div>

    <section className={cn('flex flex-col', verticallyCentered ? 'flex-1 justify-center' : 'mt-8')}>
      {badge ? <div className={cn('mb-5', centered && 'text-center')}>{badge}</div> : null}

      <h1
        className={cn(
          'text-[2rem] leading-[1.35] font-bold tracking-[-0.035em] text-cool-900',
          centered && 'text-center',
        )}
      >
        {title}
      </h1>

      {description ? (
        <div className={cn('mt-4 text-base leading-7 text-cool-600', centered && 'text-center')}>
          {description}
        </div>
      ) : null}

      <div className="mt-8">{children}</div>
    </section>

    <div className="mt-auto pt-10">{action}</div>
  </main>
);
