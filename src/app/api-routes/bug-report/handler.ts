import { NextResponse, type NextRequest } from 'next/server';

interface BugReportRequestBody {
  title?: string;
  description?: string;
  pageUrl?: string;
}

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const TITLE_MAX_LENGTH = 50;
const DESCRIPTION_MAX_LENGTH = 500;
const PAGE_URL_MAX_LENGTH = 2_048;
const RATE_LIMIT_MAX_REQUESTS = 3;
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_ENTRIES = 10_000;
const rateLimitEntries = new Map<string, RateLimitEntry>();
let lastRateLimitCleanupAt = 0;

const buildDiscordMessage = ({ title, description, pageUrl }: Required<BugReportRequestBody>) =>
  [
    '🐞 **버그 제보**',
    `**제목**: ${title}`,
    `**내용**: ${description}`,
    `**페이지**: ${pageUrl}`,
  ].join('\n');

const getClientIdentifier = (request: NextRequest) => {
  const realIp = request.headers.get('x-real-ip')?.trim();
  if (realIp) return realIp;

  const forwardedIps = request.headers
    .get('x-forwarded-for')
    ?.split(',')
    .map((ip) => ip.trim())
    .filter(Boolean);

  return forwardedIps?.at(-1) || 'unknown';
};

const checkRateLimit = (clientIdentifier: string) => {
  const now = Date.now();

  if (now - lastRateLimitCleanupAt >= RATE_LIMIT_WINDOW_MS) {
    for (const [identifier, entry] of rateLimitEntries) {
      if (entry.resetAt <= now) rateLimitEntries.delete(identifier);
    }
    lastRateLimitCleanupAt = now;
  }

  const currentEntry = rateLimitEntries.get(clientIdentifier);

  if (!currentEntry || currentEntry.resetAt <= now) {
    if (!currentEntry && rateLimitEntries.size >= RATE_LIMIT_MAX_ENTRIES) {
      return {
        isAllowed: false,
        retryAfterSeconds: Math.ceil(RATE_LIMIT_WINDOW_MS / 1_000),
      };
    }

    rateLimitEntries.set(clientIdentifier, {
      count: 1,
      resetAt: now + RATE_LIMIT_WINDOW_MS,
    });
    return { isAllowed: true, retryAfterSeconds: 0 };
  }

  if (currentEntry.count >= RATE_LIMIT_MAX_REQUESTS) {
    return {
      isAllowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil((currentEntry.resetAt - now) / 1_000)),
    };
  }

  currentEntry.count += 1;
  return { isAllowed: true, retryAfterSeconds: 0 };
};

export const POST = async (request: NextRequest) => {
  const webhookUrl = process.env.BUG_REPORT_DISCORD_WEBHOOK_URL;

  if (!webhookUrl) {
    return NextResponse.json(
      { success: false, error: '디스코드 웹훅이 설정되지 않았습니다.' },
      { status: 500 },
    );
  }

  const rateLimit = checkRateLimit(getClientIdentifier(request));

  if (!rateLimit.isAllowed) {
    return NextResponse.json(
      { success: false, error: '버그 제보 요청이 너무 많습니다. 잠시 후 다시 시도해주세요.' },
      {
        status: 429,
        headers: { 'Retry-After': String(rateLimit.retryAfterSeconds) },
      },
    );
  }

  const body = (await request.json().catch(() => null)) as BugReportRequestBody | null;
  const title = body?.title?.trim();
  const description = body?.description?.trim();
  const pageUrl = body?.pageUrl?.trim() || '알 수 없음';

  if (!title || !description) {
    return NextResponse.json(
      { success: false, error: '제목과 내용을 입력해주세요.' },
      { status: 400 },
    );
  }

  if (title.length > TITLE_MAX_LENGTH || description.length > DESCRIPTION_MAX_LENGTH) {
    return NextResponse.json(
      {
        success: false,
        error: `제목은 ${TITLE_MAX_LENGTH}자, 내용은 ${DESCRIPTION_MAX_LENGTH}자 이하로 입력해주세요.`,
      },
      { status: 400 },
    );
  }

  if (pageUrl.length > PAGE_URL_MAX_LENGTH) {
    return NextResponse.json(
      { success: false, error: '페이지 주소가 너무 깁니다.' },
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
        pageUrl,
      }),
      allowed_mentions: { parse: [] },
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
