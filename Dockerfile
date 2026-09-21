# ---------- Dependencies Stage ----------
FROM node:24-alpine AS deps
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@11.21.0 --activate

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# husky는 git hook 설정 도구로 컨테이너에는 .git이 없어 prepare 스크립트가 실패함 → 비활성화
ENV HUSKY=0
RUN pnpm install --frozen-lockfile

# ---------- Build Stage ----------
FROM node:24-alpine AS builder
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@11.21.0 --activate

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# 값은 여기 적지 않고 빌드 명령의 --build-arg로 주입 (Git에 값이 올라가지 않도록)
# ARG로 선언한 값은 같은 스테이지의 RUN 실행 중 환경변수로 보이므로 ENV는 따로 필요 없음
# NEXT_PUBLIC_* 값은 next build 시점에 클라이언트 번들에 문자열로 치환됨
ARG NEXT_PUBLIC_KAKAO_REST_API_KEY
ARG NEXT_PUBLIC_KAKAO_REDIRECT_URI
ARG NEXT_PUBLIC_API_BASE_URL

# next.config의 rewrites 등에서 빌드 때 API_BASE_URL을 쓰는 경우에만 주석 해제
ARG API_BASE_URL

RUN pnpm run build

# ---------- Runtime Stage ----------
FROM node:24-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT=3000
# 컨테이너 ID로 바인딩되는 것을 막고 모든 인터페이스(127.0.0.1 포함)에서 수신
ENV HOSTNAME=0.0.0.0

CMD ["node", "server.js"]

