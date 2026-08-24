FROM node:22-bookworm-slim

WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./

RUN npm ci

COPY prisma ./prisma

RUN npx prisma generate

COPY src ./src

EXPOSE 5000

CMD ["sh", "-c", "npx prisma migrate deploy && node src/server.js"]