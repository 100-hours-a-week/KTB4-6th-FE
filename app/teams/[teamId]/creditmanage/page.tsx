import { CreditManagementPage } from '@/views/credit-management';

interface CreditManageProps {
  params: Promise<{ teamId: string }>;
}

export default async function CreditManage({ params }: CreditManageProps) {
  const { teamId } = await params;

  return <CreditManagementPage teamId={Number(teamId)} />;
}
