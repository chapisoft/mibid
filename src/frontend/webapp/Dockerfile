# ==============================================================================
# MIBID ENTERPRISE FRONTEND WEB APPLICATION DOCKERFILE (NEXT.JS 14 / NODE 20)
# ==============================================================================

# ------------------------------------------------------------------------------
# Stage 1: Dependencies & Build
# ------------------------------------------------------------------------------
FROM node:20-alpine AS builder

WORKDIR /app

# Cài đặt thư viện phụ thuộc
COPY package*.json ./
RUN npm ci || npm install

# Sao chép mã nguồn và đóng gói bản build Next.js
COPY . .

ARG NEXT_PUBLIC_API_URL=/api/v1
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

RUN npm run build

# ------------------------------------------------------------------------------
# Stage 2: Runtime Image gọn nhẹ và bảo mật
# ------------------------------------------------------------------------------
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Tạo người dùng phi đặc quyền bảo mật
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Sao chép các tệp tài nguyên tĩnh và bundle cần thiết
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

USER nextjs

EXPOSE 3000

CMD ["npm", "start"]
