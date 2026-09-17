import type { Metadata } from 'next';
import { Space_Grotesk } from 'next/font/google';
import { AppProviders } from '@/app/providers';
import { cn } from '@/shared/lib';
import './globals.css';

// 워드마크("Meety") 전용 디스플레이 서체. 본문/UI 한글 텍스트는 Pretendard(아래 head의 link)를 사용.
const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['700'],
  variable: '--font-display',
});

export const metadata: Metadata = {
  title: 'Meety',
  description: '회의가 끝나면 요약과 태스크는 이미 정리되어 있습니다',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html
      lang="ko"
      suppressHydrationWarning
      className={cn('h-full', 'antialiased', spaceGrotesk.variable, 'font-sans')}
    >
      <head>
        {/* Pretendard: 한글 UI 서체. Google Fonts 카탈로그에 없어 next/font 대신 동적 서브셋 CDN으로 로드. */}
        <link rel="preconnect" href="https://cdn.jsdelivr.net" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
      </head>
      <body className="min-h-full bg-cool-100">
        <AppProviders>
          {/* 기준 화면: 390 x 844(min-height), iPhone 12/13/14 계열. 콘텐츠가 넘치면 스크롤. */}
          {/* id="app-frame": 토스트 포털을 이 프레임 안에 가두기 위한 앵커(src/shared/ui/toast.tsx 참고) */}
          <div
            id="app-frame"
            className="relative isolate mx-auto flex min-h-[844px] w-full max-w-[390px] flex-col bg-white"
          >
            {children}
          </div>
        </AppProviders>
      </body>
    </html>
  );
}
