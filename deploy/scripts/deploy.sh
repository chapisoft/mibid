#!/bin/bash
set -e

echo "[INFO] Khởi động quy trình triển khai Mibid..."

cd "$(dirname "$0")/.."

echo "[INFO] Kéo hình ảnh và khởi động các container..."
docker compose pull || true
docker compose up -d --build --remove-orphans

echo "[INFO] Kiểm tra trạng thái các dịch vụ..."
docker compose ps

echo "[INFO] Triển khai thành công hệ thống Mibid!"
