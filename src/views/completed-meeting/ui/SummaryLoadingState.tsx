import { SummarySkeletonCards } from './SummarySkeletonCards';

/** 요약을 처음 불러오는 동안 보여준다. 아직 생성 중인지 모르는 상태라 안내 문구 없이 자리표시 카드만 보여준다. */
export const SummaryLoadingState = () => (
  <div
    role="status"
    aria-label="요약을 불러오는 중입니다"
    className="flex flex-col gap-3 px-5 py-5"
  >
    <SummarySkeletonCards />
  </div>
);
