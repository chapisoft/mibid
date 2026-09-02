#!/usr/bin/env bash
# ==============================================================================
# Kịch bản kiểm tra sức khỏe toàn diện hệ thống MIBID
# ==============================================================================

set -e

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "========================================================"
echo "    KIỂM TRA SỨC KHỎE CỤM DỊCH VỤ MIBID ENTERPRISE     "
echo "========================================================"

# 1. Trạng thái các container
echo -e "\n${YELLOW}[1] Trạng thái Docker Container:${NC}"
docker compose -p mibid ps

# 2. Kiểm tra PostgreSQL
echo -e "\n${YELLOW}[2] Kiểm tra PostgreSQL (Port 15438):${NC}"
if docker exec mibid-postgres pg_isready -U mibid_admin -d mibid_prod >/dev/null 2>&1; then
    echo -e "${GREEN}✓ PostgreSQL is HEALTHY and accepting connections${NC}"
else
    echo -e "${RED}✗ PostgreSQL is DOWN or NOT ACCEPTING CONNECTIONS${NC}"
fi

# 3. Kiểm tra Redis
echo -e "\n${YELLOW}[3] Kiểm tra Redis (Port 16388):${NC}"
REDIS_PING=$(docker exec mibid-redis redis-cli ping 2>/dev/null || echo "FAIL")
if [ "$REDIS_PING" = "PONG" ]; then
    echo -e "${GREEN}✓ Redis is HEALTHY (PONG received)${NC}"
else
    echo -e "${RED}✗ Redis is DOWN${NC}"
fi

# 4. Kiểm tra MinIO S3
echo -e "\n${YELLOW}[4] Kiểm tra MinIO S3 (Port 19008):${NC}"
MINIO_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:19008/minio/health/live || echo "FAIL")
if [ "$MINIO_STATUS" = "200" ]; then
    echo -e "${GREEN}✓ MinIO S3 is HEALTHY (HTTP 200)${NC}"
else
    echo -e "${RED}✗ MinIO S3 returned status: $MINIO_STATUS${NC}"
fi

# 5. Kiểm tra Backend Actuator Health
echo -e "\n${YELLOW}[5] Kiểm tra Backend Spring Boot Health:${NC}"
BACKEND_HEALTH=$(curl -s http://127.0.0.1:18098/actuator/health 2>/dev/null || echo "FAIL")
echo "Backend Status: $BACKEND_HEALTH"

# 6. Kiểm tra Nginx Gateway Host Virtual Hosts
echo -e "\n${YELLOW}[6] Đo kiểm Virtual Host qua Nginx Host Gateway:${NC}"
FE_CODE=$(curl -s -o /dev/null -w "%{http_code}" -H "Host: bid.microtec.vn" http://127.0.0.1:18098/ || echo "FAIL")
BE_CODE=$(curl -s -o /dev/null -w "%{http_code}" -H "Host: api-bid.microtec.vn" http://127.0.0.1:18098/actuator/health || echo "FAIL")

echo "Frontend (bid.microtec.vn): HTTP $FE_CODE"
echo "Backend  (api-bid.microtec.vn): HTTP $BE_CODE"

echo -e "\n${GREEN}✓ Hoàn tất kiểm tra sức khỏe hệ thống MIBID.${NC}"
