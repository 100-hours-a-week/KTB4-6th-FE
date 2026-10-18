'use client';

import { useEffect } from 'react';
import { captureException } from '@/shared/lib';

interface GlobalErrorProps {
  error: Error & { digest?: string };
  retry: () => void;
}

export default function GlobalError({ error, retry }: GlobalErrorProps) {
  useEffect(() => {
    captureException(error);
  }, [error]);

  return (
    <html lang="ko">
      <body>
        <main>
          <h1>오류가 발생했습니다.</h1>
          <p>잠시 후 다시 시도해 주세요.</p>
          <button type="button" onClick={retry}>
            다시 시도
          </button>
        </main>
      </body>
    </html>
  );
}
