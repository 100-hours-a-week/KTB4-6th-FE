import type { ComponentProps } from 'react';
import type { Badge } from '@/shared/ui';
import type { Meeting } from './type';

interface MeetingStatusBadge {
  label: string;
  variant: ComponentProps<typeof Badge>['variant'];
}

export const MEETING_STATUS_BADGE: Record<Meeting['status'], MeetingStatusBadge> = {
  scheduled: { label: '예정', variant: 'brand' },
  waiting: { label: '대기 중', variant: 'warning' },
  in_progress: { label: '진행 중', variant: 'danger' },
  completed: { label: '종료됨', variant: 'neutral' },
};
