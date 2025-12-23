# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

COPY PaymentService/package*.json ./
COPY PaymentService/prisma.config.ts ./
COPY PaymentService/prisma ./prisma/

RUN npm install

COPY PaymentService/ ./

ENV DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy"
RUN npx prisma generate

RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

COPY PaymentService/package*.json ./
COPY PaymentService/prisma.config.ts ./

RUN npm install --omit=dev

COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/generated ./generated
COPY --from=builder /app/dist ./dist

COPY PaymentService/docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

EXPOSE 3002

ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]

CMD ["npm", "start"]
