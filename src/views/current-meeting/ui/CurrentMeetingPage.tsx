import { ChevronDown, Headphones, Menu, MoreVertical } from 'lucide-react';

export const CurrentMeetingPage = () => (
  <div className="flex min-h-[844px] flex-1 flex-col bg-cool-50">
    <header className="shrink-0 border-b border-cool-200 bg-white px-5 pt-5 pb-4">
      <div className="flex h-10 items-center gap-2">
        <button
          type="button"
          aria-label="메뉴 열기"
          disabled
          className="flex size-9 shrink-0 items-center justify-center rounded-full text-cool-900"
        >
          <Menu className="size-5" strokeWidth={2} />
        </button>
        <h1 className="text-lg font-bold text-cool-900">현재 회의</h1>
        <span className="ml-auto flex items-center gap-1.5 whitespace-nowrap text-xs text-cool-600">
          <span aria-hidden="true" className="size-2 rounded-full bg-success" />
          서버 연결 됨
        </span>
      </div>

      <div className="mt-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="truncate text-xl font-bold text-cool-900">기획 리뷰 회의</h2>
          <p className="mt-1 text-sm text-cool-500">참여자 3 / 5</p>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <span className="rounded-lg bg-brand-100 px-2.5 py-1 text-xs font-semibold text-brand-600">
            ● 대기 중
          </span>
          <ChevronDown aria-hidden="true" className="size-5 text-cool-600" strokeWidth={2} />
        </div>
      </div>
    </header>

    <main className="flex flex-1 flex-col items-center justify-center px-6 py-10 text-center">
      <div className="flex size-16 items-center justify-center rounded-2xl bg-brand-100 text-brand-600">
        <Headphones aria-hidden="true" className="size-7" strokeWidth={2.2} />
      </div>
      <p className="mt-5 text-base font-bold text-cool-900">녹음 시작을 눌러 회의를 기록해주세요</p>
      <p className="mt-4 text-sm leading-6 text-cool-600">
        참여자 누구나 녹음을 시작할 수 있어요.
        <br />
        시작한 사람이 일시정지와 종료를 관리합니다.
      </p>
    </main>

    <footer className="grid shrink-0 grid-cols-[1fr_1fr_36px] items-center gap-2 border-t border-cool-200 bg-white px-5 py-3">
      <button
        type="button"
        disabled
        className="h-12 rounded-xl bg-brand-600 px-2 text-sm font-semibold text-white"
      >
        녹음 시작
      </button>
      <button
        type="button"
        disabled
        className="h-12 rounded-xl border border-cool-200 bg-white px-2 text-sm font-semibold text-cool-700"
      >
        회의 나가기
      </button>
      <button
        type="button"
        aria-label="더 보기"
        disabled
        className="flex size-9 items-center justify-center text-cool-600"
      >
        <MoreVertical className="size-5" strokeWidth={2} />
      </button>
    </footer>
  </div>
);
