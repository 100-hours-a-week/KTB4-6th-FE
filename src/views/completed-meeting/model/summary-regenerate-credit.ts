import { SUMMARY_REGENERATE_CREDIT_COST } from '@/features/credit-management';

export { SUMMARY_REGENERATE_CREDIT_COST };

export const canRegenerateSummary = (currentCredits: number) =>
  currentCredits >= SUMMARY_REGENERATE_CREDIT_COST;
