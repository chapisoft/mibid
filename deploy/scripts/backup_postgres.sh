#!/bin/bash
set -e

BACKUP_DIR="/backup/db"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
FILENAME="mibid_backup_${TIMESTAMP}.dump"

mkdir -p "${BACKUP_DIR}"

echo "[INFO] Đang thực hiện sao lưu CSDL PostgreSQL Mibid: ${FILENAME}..."
docker exec mibid-postgres pg_dump -U mibid_admin -d mibid_prod -Fc > "${BACKUP_DIR}/${FILENAME}"

echo "[INFO] Sao lưu hoàn tất. Kích thước file: $(du -sh "${BACKUP_DIR}/${FILENAME}" | cut -f1)"

# Xóa các bản sao lưu cũ hơn 30 ngày
find "${BACKUP_DIR}" -name "mibid_backup_*.dump" -mtime +30 -delete
echo "[INFO] Đã dọn dẹp các bản sao lưu cũ quá 30 ngày."
