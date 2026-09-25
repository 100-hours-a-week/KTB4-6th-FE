/** AI 요약을 재생성할 때 소모되는 크레딧 */
export const SUMMARY_REGENERATE_CREDIT_COST = 3;

export const canRegenerateSummary = (currentCredits: number) =>
  currentCredits >= SUMMARY_REGENERATE_CREDIT_COST;
