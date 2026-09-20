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

# 클라이언트 번들에 빌드 시점 값으로 치환됨 (NEXT_PUBLIC_ 접두사)
# 하드코딩 방식이므로 ARG 선언은 두지 않음 (같은 이름의 ARG가 있으면 --build-arg가 무시되어 혼동됨)

# (필요한 경우에만) next.config의 rewrites 등에서 API_BASE_URL을 빌드 때 쓴다면 아래 주석 해제

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

CMD ["node", "server.js"]
