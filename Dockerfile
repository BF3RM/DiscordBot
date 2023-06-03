FROM node:18 as builder
WORKDIR /app

RUN corepack enable pnpm

COPY pnpm-lock.yaml .
RUN pnpm fetch

COPY package.json .
RUN pnpm install --offline

COPY . .
RUN pnpm build

RUN pnpm prune --prod

FROM node:18 as runtime

LABEL org.opencontainers.image.source https://github.com/BF3RM/DiscordBot

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./

CMD ["node", "index.js"]