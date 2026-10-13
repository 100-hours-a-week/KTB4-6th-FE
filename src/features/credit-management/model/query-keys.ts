export const creditLedgerKeys = {
  all: (teamId: number) => ['teams', teamId, 'credit-ledgers'] as const,
  list: (teamId: number) => [...creditLedgerKeys.all(teamId), 'list'] as const,
};
