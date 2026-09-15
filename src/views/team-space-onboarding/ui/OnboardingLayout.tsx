import type { ReactNode } from 'react';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

interface OnboardingLayoutProps {
  action: ReactNode;
  backHref?: string;
  children: ReactNode;
  description?: ReactNode;
  step?: number;
  title: ReactNode;
  totalSteps?: number;
}

export const OnboardingLayout = ({
  action,
  backHref,
  children,
  description,
  step,
  title,
  totalSteps,
}: OnboardingLayoutProps) => (
  <main className="flex min-h-[844px] flex-1 flex-col bg-white px-7 pt-14 pb-9">
    {backHref ? (
      <Link
        href={backHref}
        aria-label="이전 화면으로 이동"
        className="-ml-2 flex size-10 items-center justify-center rounded-full text-cool-900 transition-colors hover:bg-cool-50 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-brand-300"
      >
        <ChevronLeft className="size-6" strokeWidth={2} />
      </Link>
    ) : (
      <div className="h-10" />
    )}

    <section className="mt-10 flex flex-col">
      {step && totalSteps ? (
        <p className="mb-4 font-mono text-sm font-medium tracking-[0.22em] text-brand-500">
          STEP {step} / {totalSteps}
        </p>
      ) : null}

      <h1 className="text-[2rem] leading-[1.35] font-bold tracking-[-0.035em] text-cool-900">
        {title}
      </h1>

      {description ? (
        <div className="mt-4 text-base leading-7 text-cool-600">{description}</div>
      ) : null}

      <div className="mt-8">{children}</div>
    </section>

    <div className="mt-auto pt-10">{action}</div>
  </main>
);
