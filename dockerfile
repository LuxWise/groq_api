FROM node:24 AS dev

WORKDIR /app
ENV NODE_ENV=develop

RUN npm install -g pnpm@10.15.0
COPY package.json pnpm-lock.yaml ./

RUN echo "//registry.npmjs.org/:_authToken=$NPM_TOKEN" > ".npmrc" && \
  pnpm install --frozen-lockfile && \
  rm -f .npmrc

COPY prisma ./prisma
COPY prisma.config.ts ./

RUN npx prisma generate

COPY tsconfig*.json .
COPY src src

EXPOSE $PORT
EXPOSE 9229
CMD [ "node", "--run", "start:dev" ]


FROM node:24 AS build

WORKDIR /app
ENV NODE_ENV=build

RUN npm install -g pnpm@10.15.0
COPY package.json pnpm-lock.yaml ./

RUN echo "//registry.npmjs.org/:_authToken=$NPM_TOKEN" > ".npmrc" && \
  pnpm install --frozen-lockfile && \
  rm -f .npmrc

COPY prisma ./prisma
COPY prisma.config.ts ./

RUN npx prisma generate

COPY tsconfig*.json .
COPY src src

RUN pnpm run build

FROM node:24 AS prod

WORKDIR /app

ENV NODE_ENV=production

COPY --from=build /app/package.json ./
COPY --from=build /app/pnpm-lock.yaml ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/prisma.config.ts ./prisma.config.ts

EXPOSE 3000
CMD ["sh", "-c", "npx prisma migrate deploy && npx prisma generate && npx prisma db seed && node dist/src/main.js"]