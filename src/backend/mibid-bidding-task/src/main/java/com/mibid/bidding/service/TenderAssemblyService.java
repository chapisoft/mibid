package com.mibid.bidding.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.Map;
import java.util.UUID;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

/**
 * Dịch vụ đóng gói hồ sơ dự thầu: Tự động tổng hợp tài liệu, gộp file và nén thành gói ZIP tiêu chuẩn.
 */
@Slf4j
@Service
public class TenderAssemblyService {

    public byte[] assembleTenderPackageZip(UUID projectId, Map<String, byte[]> documentFiles) throws IOException {
        log.info("Bắt đầu đóng gói hồ sơ dự thầu ZIP cho Dự án {}", projectId);
        try (ByteArrayOutputStream baos = new ByteArrayOutputStream();
             ZipOutputStream zos = new ZipOutputStream(baos)) {

            for (Map.Entry<String, byte[]> entry : documentFiles.entrySet()) {
                ZipEntry zipEntry = new ZipEntry(entry.getKey());
                zos.putNextEntry(zipEntry);
                zos.write(entry.getValue());
                zos.closeEntry();
            }

            zos.finish();
            log.info("Hoàn tất đóng gói hồ sơ thầu ZIP (Tổng số tệp: {})", documentFiles.size());
            return baos.toByteArray();
        }
    }
}
