# ==============================================================================
# MIBID FRONTEND WEBAPP RUNTIME DOCKERFILE (NODE 20 ALPINE)
# Sử dụng bản build đã biên dịch sẵn từ máy trạm để tiết kiệm RAM/CPU máy chủ
# ==============================================================================

FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV NEXT_PUBLIC_API_URL=https://api-bid.microtec.vn/api/v1

# Tạo người dùng phi đặc quyền bảo mật
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Sao chép package.json và cài đặt production dependencies
COPY package*.json ./
RUN npm install --omit=dev --ignore-scripts

# Sao chép toàn bộ mã nguồn và thư mục .next đã build
COPY --chown=nextjs:nodejs . .

USER nextjs

EXPOSE 3000

CMD ["npm", "start"]
