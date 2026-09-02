#!/usr/bin/env bash
# ==============================================================================
# QUY TRÌNH TRIỂN KHAI TỰ ĐỘNG HỆ THỐNG MIBID LÊN MÁY CHỦ (DOCKER COMPOSE)
# Mã tài liệu: MIBID_HDCD_VH_v1.0
# Tên miền: bid.microtec.vn (FE) | api-bid.microtec.vn (BE)
# ==============================================================================

set -e

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}================================================================${NC}"
echo -e "${BLUE}        KHỞI ĐỘNG QUY TRÌNH TRIỂN KHAI NỀN TẢNG MIBID           ${NC}"
echo -e "${BLUE}================================================================${NC}"

# Chuyển vào thư mục deploy
DEPLOY_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "${DEPLOY_DIR}"

# 1. Kiểm tra cấu trúc thư mục dữ liệu kiên cố
echo -e "\n${YELLOW}[1/5] Kiểm tra và khởi tạo thư mục lưu trữ dữ liệu...${NC}"
mkdir -p data/postgres data/redis data/minio logs backups
chmod 777 data/postgres data/redis data/minio logs backups

# 2. Xác thực tệp cấu hình môi trường
echo -e "\n${YELLOW}[2/5] Xác thực cấu hình biến môi trường (.env)...${NC}"
if [ ! -f ".env" ]; then
    echo -e "${RED}[ERROR] Không tìm thấy tệp .env tại ${DEPLOY_DIR}!${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Tệp .env hợp lệ.${NC}"

TARGET="${1:-all}"

case "${TARGET}" in
    frontend|fe)
        echo -e "\n${YELLOW}[TRIỂN KHAI PHÂN HỆ] Biên dịch và khởi động lại duy nhất mibid-frontend...${NC}"
        docker compose -p mibid build frontend
        docker compose -p mibid up -d --no-deps frontend
        ;;
    backend|be)
        echo -e "\n${YELLOW}[TRIỂN KHAI PHÂN HỆ] Biên dịch và khởi động lại duy nhất mibid-backend...${NC}"
        docker compose -p mibid build backend
        docker compose -p mibid up -d --no-deps backend
        ;;
    nginx)
        echo -e "\n${YELLOW}[TRIỂN KHAI PHÂN HỆ] Nạp lại cấu hình mibid-nginx...${NC}"
        docker exec mibid-nginx nginx -t
        docker exec mibid-nginx nginx -s reload
        ;;
    database|db)
        echo -e "\n${YELLOW}[TRIỂN KHAI PHÂN HỆ] Kiểm tra trạng thái vùng chứa CSDL...${NC}"
        docker compose -p mibid ps postgres
        ;;
    all)
        echo -e "\n${YELLOW}[3/5] Khởi tạo và kích hoạt toàn cụm 6 vùng chứa MIBID...${NC}"
        docker compose -p mibid up -d --build --remove-orphans
        ;;
    *)
        echo -e "${RED}[ERROR] Phân hệ không hợp lệ: ${TARGET}${NC}"
        echo -e "Các phân hệ hợp lệ: all | frontend | backend | nginx | database"
        exit 1
        ;;
esac

# 4. Chờ dịch vụ ổn định và kiểm tra trạng thái
echo -e "\n${YELLOW}[4/5] Chờ ổn định dịch vụ (5 giây)...${NC}"
sleep 5
docker compose -p mibid ps

# 5. Đo kiểm kết nối sức khỏe
echo -e "\n${YELLOW}[5/5] Đo kiểm sức khỏe các điểm cuối cốt lõi...${NC}"
if [ -f "scripts/check_health.sh" ]; then
    bash scripts/check_health.sh
fi

echo -e "\n${GREEN}================================================================${NC}"
echo -e "${GREEN}  ✓ HOÀN TẤT TRIỂN KHAI PHÂN HỆ [${TARGET}] THÀNH CÔNG!          ${NC}"
echo -e "${GREEN}  - Frontend WebApp: https://bid.microtec.vn                    ${NC}"
echo -e "${GREEN}  - Backend API:     https://api-bid.microtec.vn/api/v1         ${NC}"
echo -e "${GREEN}  - Actuator Health: https://api-bid.microtec.vn/actuator/health${NC}"
echo -e "${GREEN}================================================================${NC}"

