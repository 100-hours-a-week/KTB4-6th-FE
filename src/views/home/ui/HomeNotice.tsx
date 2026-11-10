'use client';

import { useHomeNotice } from '../model/useHomeNotice';

interface HomeNoticeProps {
  teamId: number;
}

export const HomeNotice = ({ teamId }: HomeNoticeProps) => {
  useHomeNotice({ teamId });

  return null;
};
