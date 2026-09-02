#!/usr/bin/env bash
# ==============================================================================
# HỆ THỐNG TRIỂN KHAI PHÂN HỆ THÔNG MINH MIBID (SMART MODULAR DEPLOYMENT)
# Mã tài liệu: MIBID_HDCD_VH_v1.0
# Tên miền: bid.microtec.vn (FE) | api-bid.microtec.vn (BE)
# Máy chủ đích: dip@210.211.102.99:65000 | Thư mục: /home/dip/mibid/deploy
# ==============================================================================

set -e

# Màu sắc giao diện Terminal
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

# Thư mục gốc dự án
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "${REPO_ROOT}"

# Cấu hình kết nối máy chủ
SSH_HOST="210.211.102.99"
SSH_PORT="65000"
SSH_USER="dip"
SSH_KEY="${HOME}/.ssh/jenkins_deploy_dev"
REMOTE_DIR="/home/dip/mibid/deploy"
STATE_FILE="${REPO_ROOT}/.deploy_state"

# Tham số mặc định
TARGET_MODULE="auto"
DRY_RUN=false
FORCE_DEPLOY=false

# Phân tích tham số dòng lệnh
for arg in "$@"; do
    case "${arg}" in
        --dry-run)
            DRY_RUN=true
            ;;
        --force|-f)
            FORCE_DEPLOY=true
            ;;
        frontend|fe)
            TARGET_MODULE="frontend"
            ;;
        backend|be)
            TARGET_MODULE="backend"
            ;;
        nginx)
            TARGET_MODULE="nginx"
            ;;
        database|db)
            TARGET_MODULE="database"
            ;;
        all)
            TARGET_MODULE="all"
            ;;
        auto)
            TARGET_MODULE="auto"
            ;;
        --help|-h)
            echo -e "${BOLD}HƯỚNG DẪN SỬ DỤNG SCRIPT TRIỂN KHAI PHÂN HỆ MIBID:${NC}"
            echo -e "  ./scripts/deploy.sh [target] [options]"
            echo -e ""
            echo -e "${BOLD}Mục tiêu triển khai [target]:${NC}"
            echo -e "  ${CYAN}auto${NC}       (Mặc định) Tự động phát hiện phân hệ có thay đổi và chỉ deploy riêng phần đó"
            echo -e "  ${CYAN}frontend${NC}   Chỉ biên dịch và deploy riêng Giao diện Frontend WebApp Next.js"
            echo -e "  ${CYAN}backend${NC}    Chỉ biên dịch maven và deploy riêng Dịch vụ Backend Spring Boot"
            echo -e "  ${CYAN}nginx${NC}      Chỉ cập nhật cấu hình và tải lại Nginx Gateway"
            echo -e "  ${CYAN}database${NC}   Chỉ đồng bộ các tệp SQL khởi tạo / di chuyển CSDL"
            echo -e "  ${CYAN}all${NC}        Triển khai đồng thời toàn bộ các phân hệ"
            echo -e ""
            echo -e "${BOLD}Tùy chọn bổ sung [options]:${NC}"
            echo -e "  ${YELLOW}--dry-run${NC}  Chỉ quét kiểm tra phân hệ thay đổi, không thực hiện build/deploy"
            echo -e "  ${YELLOW}--force, -f${NC}Bỏ qua kiểm tra mã băm thay đổi, ép buộc deploy lại"
            echo -e "  ${YELLOW}--help, -h${NC} Hiển thị hướng dẫn này"
            exit 0
            ;;
        *)
            echo -e "${RED}[ERROR] Tham số không hợp lệ: ${arg}${NC}"
            echo -e "Sử dụng ${CYAN}./scripts/deploy.sh --help${NC} để xem danh sách tham số."
            exit 1
            ;;
    esac
done

echo -e "${BLUE}================================================================${NC}"
echo -e "${BLUE}${BOLD}   HỆ THỐNG TRIỂN KHAI PHÂN HỆ TỐI ƯU MIBID (MODULAR DEPLOY)   ${NC}"
echo -e "${BLUE}================================================================${NC}"
echo -e "• Máy chủ đích:   ${CYAN}${SSH_USER}@${SSH_HOST}:${SSH_PORT}${NC}"
echo -e "• Thư mục từ xa:  ${CYAN}${REMOTE_DIR}${NC}"
echo -e "• Chế độ chọn:    ${PURPLE}${TARGET_MODULE}${NC} $([ "${FORCE_DEPLOY}" = true ] && echo -e "${YELLOW}[FORCE]${NC}") $([ "${DRY_RUN}" = true ] && echo -e "${YELLOW}[DRY-RUN]${NC}")"
echo -e "• Thời gian chạy: $(date '+%Y-%m-%d %H:%M:%S')"
echo -e "${BLUE}----------------------------------------------------------------${NC}"

# Hàm tính mã băm SHA-256 của từng phân hệ
calc_fe_hash() {
    find src/frontend/webapp/src src/frontend/webapp/public src/frontend/webapp/package.json src/frontend/webapp/.env.production -type f 2>/dev/null \
        | sort \
        | xargs shasum -a 256 2>/dev/null \
        | shasum -a 256 2>/dev/null \
        | awk '{print $1}'
}

calc_be_hash() {
    find src/backend -type f \( -name "*.java" -o -name "pom.xml" -o -name "*.properties" -o -name "*.yml" -o -name "*.sql" \) 2>/dev/null \
        | sort \
        | xargs shasum -a 256 2>/dev/null \
        | shasum -a 256 2>/dev/null \
        | awk '{print $1}'
}

calc_nginx_hash() {
    find deploy/nginx -type f 2>/dev/null \
        | sort \
        | xargs shasum -a 256 2>/dev/null \
        | shasum -a 256 2>/dev/null \
        | awk '{print $1}'
}

calc_db_hash() {
    find database deploy/database -type f -name "*.sql" 2>/dev/null \
        | sort \
        | xargs shasum -a 256 2>/dev/null \
        | shasum -a 256 2>/dev/null \
        | awk '{print $1}'
}

# Đọc mã băm từ lần triển khai trước
LAST_FE_HASH=""
LAST_BE_HASH=""
LAST_NGINX_HASH=""
LAST_DB_HASH=""

if [ -f "${STATE_FILE}" ]; then
    # shellcheck source=/dev/null
    source "${STATE_FILE}"
fi

CURRENT_FE_HASH=$(calc_fe_hash)
CURRENT_BE_HASH=$(calc_be_hash)
CURRENT_NGINX_HASH=$(calc_nginx_hash)
CURRENT_DB_HASH=$(calc_db_hash)

# Xác định phân hệ cần triển khai
DEPLOY_FE=false
DEPLOY_BE=false
DEPLOY_NGINX=false
DEPLOY_DB=false

if [ "${TARGET_MODULE}" = "all" ]; then
    DEPLOY_FE=true
    DEPLOY_BE=true
    DEPLOY_NGINX=true
    DEPLOY_DB=true
elif [ "${TARGET_MODULE}" = "frontend" ]; then
    DEPLOY_FE=true
elif [ "${TARGET_MODULE}" = "backend" ]; then
    DEPLOY_BE=true
elif [ "${TARGET_MODULE}" = "nginx" ]; then
    DEPLOY_NGINX=true
elif [ "${TARGET_MODULE}" = "database" ]; then
    DEPLOY_DB=true
elif [ "${TARGET_MODULE}" = "auto" ]; then
    if [ "${FORCE_DEPLOY}" = true ] || [ "${CURRENT_FE_HASH}" != "${LAST_FE_HASH}" ]; then
        DEPLOY_FE=true
    fi
    if [ "${FORCE_DEPLOY}" = true ] || [ "${CURRENT_BE_HASH}" != "${LAST_BE_HASH}" ]; then
        DEPLOY_BE=true
    fi
    if [ "${FORCE_DEPLOY}" = true ] || [ "${CURRENT_NGINX_HASH}" != "${LAST_NGINX_HASH}" ]; then
        DEPLOY_NGINX=true
    fi
    if [ "${FORCE_DEPLOY}" = true ] || [ "${CURRENT_DB_HASH}" != "${LAST_DB_HASH}" ]; then
        DEPLOY_DB=true
    fi
fi

# Hiển thị bảng ma trận trạng thái thay đổi
echo -e "\n${BOLD}MA TRẬN ĐÁNH GIÁ THAY ĐỔI THEO PHÂN HỆ:${NC}"
printf "  %-18s | %-12s | %-12s | %-15s\n" "Phân Hệ Dịch Vụ" "Lần Trước" "Hiện Tại" "Quyết Định"
printf "  -------------------|--------------|--------------|----------------\n"

format_status() {
    local name="$1"
    local last="$2"
    local curr="$3"
    local will_deploy="$4"
    local short_last="${last:0:8}"
    local short_curr="${curr:0:8}"
    [ -z "${short_last}" ] && short_last="chưa lưu"

    local decision_str=""
    if [ "${will_deploy}" = true ]; then
        decision_str="${GREEN}✓ CẦN DEPLOY${NC}"
    else
        decision_str="${CYAN}— BỎ QUA${NC}"
    fi
    printf "  %-18s | %-12s | %-12s | " "${name}" "${short_last}" "${short_curr}"
    echo -e "${decision_str}"
}

format_status "1. Frontend WebApp" "${LAST_FE_HASH}" "${CURRENT_FE_HASH}" "${DEPLOY_FE}"
format_status "2. Backend Server"  "${LAST_BE_HASH}" "${CURRENT_BE_HASH}" "${DEPLOY_BE}"
format_status "3. Nginx Gateway"   "${LAST_NGINX_HASH}" "${CURRENT_NGINX_HASH}" "${DEPLOY_NGINX}"
format_status "4. Database SQL"    "${LAST_DB_HASH}" "${CURRENT_DB_HASH}" "${DEPLOY_DB}"

# Kiểm tra xem có gì cần deploy không
if [ "${DEPLOY_FE}" = false ] && [ "${DEPLOY_BE}" = false ] && [ "${DEPLOY_NGINX}" = false ] && [ "${DEPLOY_DB}" = false ]; then
    echo -e "\n${GREEN}✓ Toàn bộ các phân hệ đều đang ở phiên bản mới nhất! Không có thay đổi nào cần triển khai.${NC}"
    echo -e "  (Mẹo: Dùng ${YELLOW}./scripts/deploy.sh --force${NC} nếu bạn muốn ép buộc triển khai lại)."
    exit 0
fi

if [ "${DRY_RUN}" = true ]; then
    echo -e "\n${YELLOW}[DRY-RUN] Quá trình kiểm tra hoàn tất. Đã dừng lại trước khi thực thi deploy.${NC}"
    exit 0
fi

# Hàm thực thi SSH lệnh từ xa
ssh_remote() {
    ssh -i "${SSH_KEY}" -p "${SSH_PORT}" "${SSH_USER}@${SSH_HOST}" "$1"
}

# ==============================================================================
# TRIỂN KHAI PHÂN HỆ 1: DATABASE
# ==============================================================================
if [ "${DEPLOY_DB}" = true ]; then
    echo -e "\n${YELLOW}>>> [1/4] ĐỒNG BỘ CSDL VÀ TỆP TIN SQL MIGRATION...${NC}"
    if [ -d "deploy/database" ]; then
        rsync -avz -e "ssh -i ${SSH_KEY} -p ${SSH_PORT}" deploy/database/ "${SSH_USER}@${SSH_HOST}:${REMOTE_DIR}/database/"
    fi
    echo -e "${GREEN}✓ Đồng bộ CSDL thành công.${NC}"
    LAST_DB_HASH="${CURRENT_DB_HASH}"
fi

# ==============================================================================
# TRIỂN KHAI PHÂN HỆ 2: BACKEND SPRING BOOT API
# ==============================================================================
if [ "${DEPLOY_BE}" = true ]; then
    echo -e "\n${YELLOW}>>> [2/4] BIÊN DỊCH VÀ TRIỂN KHAI BACKEND SPRING BOOT...${NC}"
    echo -e "• Đang biên dịch Maven gói nhị phân (mvn clean package -DskipTests)..."
    (cd src/backend/mibid-iam-dms && mvn clean package -DskipTests -q)
    
    JAR_PATH="src/backend/mibid-iam-dms/target/mibid-server.jar"
    if [ ! -f "${JAR_PATH}" ]; then
        JAR_PATH=$(find src/backend -name "mibid-server*.jar" -o -name "mibid-iam-dms*.jar" 2>/dev/null | grep -v "original" | head -n 1)
    fi

    if [ -z "${JAR_PATH}" ] || [ ! -f "${JAR_PATH}" ]; then
        echo -e "${RED}[ERROR] Không tìm thấy tệp mibid-server.jar sau khi biên dịch!${NC}"
        exit 1
    fi

    echo -e "• Đang truyền tệp nhị phân sang máy chủ: $(ls -lh "${JAR_PATH}" | awk '{print $5}')..."
    scp -i "${SSH_KEY}" -P "${SSH_PORT}" "${JAR_PATH}" "${SSH_USER}@${SSH_HOST}:${REMOTE_DIR}/backend/mibid-server.jar"

    echo -e "• Khởi động lại container mibid-backend trên máy chủ..."
    ssh_remote "cd ${REMOTE_DIR} && docker compose build backend && docker compose up -d --no-deps backend"

    echo -e "• Đo kiểm Actuator Health Backend..."
    sleep 8
    BE_STATUS=$(curl -s -m 5 https://api-bid.microtec.vn/actuator/health || true)
    if echo "${BE_STATUS}" | grep -q "UP"; then
        echo -e "${GREEN}✓ Backend đã khởi động thành công (Status: UP).${NC}"
    else
        echo -e "${YELLOW}⚠ Backend đang khởi động, phản hồi: ${BE_STATUS}${NC}"
    fi

    LAST_BE_HASH="${CURRENT_BE_HASH}"
fi

# ==============================================================================
# TRIỂN KHAI PHÂN HỆ 3: FRONTEND WEBAPP NEXT.JS
# ==============================================================================
if [ "${DEPLOY_FE}" = true ]; then
    echo -e "\n${YELLOW}>>> [3/4] BIÊN DỊCH VÀ TRIỂN KHAI FRONTEND WEBAPP...${NC}"
    echo -e "• Đang biên dịch Next.js production build..."
    (cd src/frontend/webapp && npm run build)

    echo -e "• Đang nén và truyền tải gói Frontend sang máy chủ..."
    tar -czf - -C src/frontend/webapp public src .next package.json next.config.js 2>/dev/null \
        | ssh_remote "tar -xzf - -C ${REMOTE_DIR}/frontend"

    # Đảm bảo không tồn tại .env.local trên máy chủ
    ssh_remote "rm -f ${REMOTE_DIR}/frontend/.env.local"

    echo -e "• Recreate container mibid-frontend trên máy chủ..."
    ssh_remote "cd ${REMOTE_DIR} && docker compose build frontend && docker compose up -d --no-deps frontend"

    echo -e "• Đo kiểm kết nối Frontend WebApp..."
    sleep 3
    FE_HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" https://bid.microtec.vn/login || true)
    if [ "${FE_HTTP_CODE}" = "200" ]; then
        echo -e "${GREEN}✓ Frontend WebApp đã trực tuyến thành công (HTTP ${FE_HTTP_CODE}).${NC}"
    else
        echo -e "${YELLOW}⚠ Frontend phản hồi mã HTTP: ${FE_HTTP_CODE}${NC}"
    fi

    LAST_FE_HASH="${CURRENT_FE_HASH}"
fi

# ==============================================================================
# TRIỂN KHAI PHÂN HỆ 4: NGINX GATEWAY
# ==============================================================================
if [ "${DEPLOY_NGINX}" = true ]; then
    echo -e "\n${YELLOW}>>> [4/4] CẬP NHẬT CẤU HÌNH VÀ TẢI LẠI NGINX GATEWAY...${NC}"
    scp -i "${SSH_KEY}" -P "${SSH_PORT}" deploy/nginx/nginx.conf "${SSH_USER}@${SSH_HOST}:${REMOTE_DIR}/nginx/nginx.conf"
    
    echo -e "• Nạp lại cấu hình Nginx trong vùng chứa..."
    ssh_remote "docker exec mibid-nginx nginx -t && docker exec mibid-nginx nginx -s reload"
    echo -e "${GREEN}✓ Nginx Gateway đã nạp cấu hình mới thành công (Zero Downtime).${NC}"

    LAST_NGINX_HASH="${CURRENT_NGINX_HASH}"
fi

# ==============================================================================
# LƯU TRẠNG THÁI TRIỂN KHAI
# ==============================================================================
cat <<EOF_STATE > "${STATE_FILE}"
# TỆP TRẠNG THÁI TRIỂN KHAI TỰ ĐỘNG MIBID - KHÔNG XÓA
LAST_DEPLOY_TIMESTAMP="$(date -u '+%Y-%m-%dT%H:%M:%SZ')"
LAST_FE_HASH="${LAST_FE_HASH}"
LAST_BE_HASH="${LAST_BE_HASH}"
LAST_NGINX_HASH="${LAST_NGINX_HASH}"
LAST_DB_HASH="${LAST_DB_HASH}"
EOF_STATE

echo -e "\n${GREEN}================================================================${NC}"
echo -e "${GREEN}${BOLD}  ✓ QUY TRÌNH TRIỂN KHAI MÔ-ĐUN MIBID HOÀN TẤT THÀNH CÔNG!     ${NC}"
echo -e "${GREEN}  - Frontend WebApp: https://bid.microtec.vn                    ${NC}"
echo -e "${GREEN}  - Backend API:     https://api-bid.microtec.vn/api/v1         ${NC}"
echo -e "${GREEN}  - Actuator Health: https://api-bid.microtec.vn/actuator/health${NC}"
echo -e "${GREEN}================================================================${NC}"
