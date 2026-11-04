import { AssistantChatLauncher } from '@/app/assistant-chat';

export default async function TeamLayout({ children, params }: LayoutProps<'/teams/[teamId]'>) {
  const { teamId } = await params;

  return (
    <>
      {children}
      <AssistantChatLauncher teamId={Number(teamId)} />
    </>
  );
}
