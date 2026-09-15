import Link from 'next/link';

interface TeamSpaceStartSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TeamSpaceStartSheet = ({ isOpen, onClose }: TeamSpaceStartSheetProps) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="absolute inset-0 z-50 flex items-end" role="dialog" aria-modal="true">
      <button
        type="button"
        aria-label="팀 스페이스 시작하기 닫기"
        onClick={onClose}
        className="absolute inset-0 bg-cool-900/40"
      />

      <section className="relative z-10 w-full rounded-t-[28px] bg-white px-6 pt-4 pb-8 shadow-[0_-12px_36px_rgba(20,34,56,0.08)]">
        <div aria-hidden="true" className="mx-auto h-1 w-10 rounded-full bg-cool-200" />

        <h2 className="mt-6 text-2xl font-bold tracking-[-0.03em] text-cool-900">
          팀 스페이스 시작하기
        </h2>
        <p className="mt-3 text-sm leading-6 text-cool-600">
          기존 팀 스페이스에 참여하거나 새로운 팀 스페이스를 만들어보세요.
        </p>

        <div className="mt-7 flex flex-col gap-3">
          <Link
            href="/team-space/join"
            className="flex h-14 items-center justify-center rounded-2xl border border-brand-600 bg-white text-base font-semibold text-brand-600 transition-colors hover:bg-brand-50 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-brand-300 active:bg-brand-100"
          >
            초대코드로 참여하기
          </Link>
          <Link
            href="/team-space/create"
            className="flex h-14 items-center justify-center rounded-2xl bg-brand-600 text-base font-semibold text-white transition-colors hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-brand-300 active:bg-brand-800"
          >
            팀 스페이스 생성하기
          </Link>
        </div>
      </section>
    </div>
  );
};
