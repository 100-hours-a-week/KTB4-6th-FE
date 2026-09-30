'use client';

import { useState } from 'react';

// 390px 모바일 프레임(app/layout.tsx의 #app-frame) DOM을 찾는다.
// 오버레이 계열 컴포넌트(Toast/Drawer/Dialog 등)의 포털 대상으로 재사용한다.
// 서버에서는 document가 없어 null이고, 클라이언트 첫 렌더 시점엔 프레임이 이미 마크업에 존재하므로 바로 찾을 수 있다.
export const useAppFrameElement = () =>
  useState<HTMLElement | null>(() =>
    typeof document === 'undefined' ? null : document.getElementById('app-frame'),
  )[0];
