#!/usr/bin/env bash
# ==============================================================================
# Kịch bản sao lưu dữ liệu tự động cho hệ thống MIBID
# Thiết lập Crontab chạy định kỳ lúc 02:00 AM mỗi ngày
# ==============================================================================

set -e

BACKUP_DIR="/home/dip/mibid/backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
mkdir -p "${BACKUP_DIR}"

echo "[$(date)] Bắt đầu sao lưu cơ sở dữ liệu PostgreSQL mibid_prod..."

# 1. Sao lưu toàn vẹn CSDL PostgreSQL kèm cấu trúc RLS
docker exec mibid-postgres pg_dump -U mibid_admin -d mibid_prod | gzip > "${BACKUP_DIR}/mibid_db_${TIMESTAMP}.sql.gz"

# 2. Xóa các bản sao lưu cũ hơn 30 ngày để tiết kiệm dung lượng đĩa
find "${BACKUP_DIR}" -type f -name "*.sql.gz" -mtime +30 -delete

echo "[$(date)] Sao lưu hoàn tất thành công: ${BACKUP_DIR}/mibid_db_${TIMESTAMP}.sql.gz"
