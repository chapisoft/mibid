package com.mibid.excel.generator;

import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Component;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.List;

/**
 * Trình sinh tệp Excel RFQ (Yêu cầu báo giá) chuẩn Apache POI gửi tới nhà cung cấp.
 */
@Slf4j
@Component
public class ExcelRfqGenerator {

    public byte[] generateRfqTemplate(String rfqCode, String projectName, List<String[]> lineItems) throws IOException {
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("RFQ_Items");

            // Header Style
            CellStyle headerStyle = workbook.createCellStyle();
            Font font = workbook.createFont();
            font.setBold(true);
            font.setColor(IndexedColors.WHITE.getIndex());
            headerStyle.setFont(font);
            headerStyle.setFillForegroundColor(IndexedColors.ROYAL_BLUE.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            headerStyle.setAlignment(HorizontalAlignment.CENTER);

            // Title row
            Row titleRow = sheet.createRow(0);
            Cell titleCell = titleRow.createCell(0);
            titleCell.setCellValue("MIBID RFQ: " + rfqCode + " - " + projectName);

            // Column Header
            Row headerRow = sheet.createRow(2);
            String[] columns = {"STT", "Mã Hàng", "Tên Hàng Hóa / Thiết Bị", "Thông Số Kỹ Thuật", "Đơn Vị Tính", "Số Lượng", "Đơn Giá Dự Thầu", "Ghi Chú"};
            for (int i = 0; i < columns.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(columns[i]);
                cell.setCellStyle(headerStyle);
            }

            // Fill rows
            int rowIdx = 3;
            int stt = 1;
            for (String[] item : lineItems) {
                Row row = sheet.createRow(rowIdx++);
                row.createCell(0).setCellValue(stt++);
                for (int c = 0; c < item.length && c < 7; c++) {
                    row.createCell(c + 1).setCellValue(item[c]);
                }
            }

            for (int i = 0; i < columns.length; i++) {
                sheet.autoSizeColumn(i);
            }

            workbook.write(out);
            return out.toByteArray();
        }
    }
}
