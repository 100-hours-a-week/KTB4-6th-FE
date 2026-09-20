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
