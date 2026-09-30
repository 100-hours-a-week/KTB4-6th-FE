import { NextResponse, type NextRequest } from 'next/server';

interface BugReportRequestBody {
  title?: string;
  description?: string;
  pageUrl?: string;
}

const buildDiscordMessage = ({ title, description, pageUrl }: Required<BugReportRequestBody>) =>
  [
    '🐞 **버그 제보**',
    `**제목**: ${title}`,
    `**내용**: ${description}`,
    `**페이지**: ${pageUrl}`,
  ].join('\n');

export const POST = async (request: NextRequest) => {
  const webhookUrl = process.env.BUG_REPORT_DISCORD_WEBHOOK_URL;

  if (!webhookUrl) {
    return NextResponse.json(
      { success: false, error: '디스코드 웹훅이 설정되지 않았습니다.' },
      { status: 500 },
    );
  }

  const body = (await request.json().catch(() => null)) as BugReportRequestBody | null;
  const title = body?.title?.trim();
  const description = body?.description?.trim();

  if (!title || !description) {
    return NextResponse.json(
      { success: false, error: '제목과 내용을 입력해주세요.' },
      { status: 400 },
    );
  }

  const discordResponse = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      content: buildDiscordMessage({
        title,
        description,
        pageUrl: body?.pageUrl || '알 수 없음',
      }),
    }),
    cache: 'no-store',
  });

  if (!discordResponse.ok) {
    return NextResponse.json(
      { success: false, error: '디스코드 알림 전송에 실패했습니다.' },
      { status: 502 },
    );
  }

  return NextResponse.json({ success: true });
};
