---
name: viettel-uat-writer
description: >-
  Kỹ năng chuyên sâu để xây dựng Kịch Bản Kiểm Thử Nghiệm Thu (UAT Test Cases) và Lập Biên Bản Tổng Hợp Nghiệm Thu UAT theo chuẩn Tập đoàn Viettel.
  Sử dụng kỹ năng này khi người dùng yêu cầu: viết kịch bản UAT, viết test case nghiệm thu người dùng Viettel, lập dashboard tổng hợp kết quả test UAT, bóc tách test cases từ tài liệu SRS/TKCT cho Viettel, tính tỷ lệ Pass/Fail/Cover tự động bằng công thức Excel, hoặc lập kịch bản kiểm thử đa kênh (Mobile App, Web CMS, USSD, API).
---

# KỸ NĂNG SOẠN THẢO KỊCH BẢN VÀ BIÊN BẢN NGHIỆM THU UAT VIETTEL (VIETTEL-UAT-WRITER)

Kỹ năng này hướng dẫn quy trình tiêu chuẩn 5 bước để bóc tách yêu cầu nghiệp vụ từ tài liệu SRS/TKCT, xây dựng bộ kịch bản kiểm thử nghiệm thu người dùng (UAT) đa nền tảng và thiết lập Dashboard tổng hợp nghiệm thu theo đúng tiêu chuẩn Tập đoàn Viettel, **bảo toàn 100% các công thức Excel động**.

---

## 1. QUY TRÌNH 5 BƯỚC SOẠN THẢO KỊCH BẢN & NGHIỆM THU UAT

```mermaid
flowchart LR
    subgraph S_STEP_LEFT ["BƯỚC 1 & 2: BÓC TÁCH VÀ THIẾT KẾ KỊCH BẢN"]
        direction TB
        ST1["BƯỚC 1: BÓC TÁCH MA TRẬN 4 NHÓM TEST CASES TỪ SRS<br/>• Nhóm 1: Kiểm tra Giao diện, phân quyền & hiển thị<br/>• Nhóm 2: Luồng nghiệp vụ chính thành công (Happy Path)<br/>• Nhóm 3: Kiểm tra ràng buộc validate dữ liệu & thông báo lỗi<br/>• Nhóm 4: Trường hợp biên, nút Back/Cancel & bẫy đồng thời"]
        ST2["BƯỚC 2: SOẠN THẢO CHI TIẾT CÁC SHEET KỊCH BẢN<br/>• Thiết lập Data test cụ thể, các bước Step 1, Step 2...<br/>• Xác định kết quả mong muốn rõ ràng (UI, API, CSDL)<br/>• Phân chia theo từng kênh: App EU, App AM, USSD, CMS"]
        ST1 --> ST2
    end

    subgraph S_STEP_RIGHT ["BƯỚC 3, 4 & 5: CÔNG THỨC KPI VÀ DASHBOARD"]
        direction TB
        ST3["BƯỚC 3: THIẾT LẬP CÔNG THỨC MÃ TC & HEADER KPI<br/>• Mã TC tự động: =IF(AND(E="",E=""),"",$F$3&"_"&ROW()-...)<br/>• Đếm Pass: =COUNTIF($N$13:$N$100,"P")<br/>• Đếm Fail: =COUNTIF($N$13:$N$100,"F")<br/>• Đếm Pending: =COUNTIF($N$13:$N$100,"PE")"]
        ST4["BƯỚC 4: THIẾT LẬP SHEET TỔNG HỢP DASHBOARD<br/>• Tự động liên kết số liệu từ các sheet: ='App AM'!F4...<br/>• Tính tỷ lệ đạt %P: =IF(G3=0,0,C3/G3)<br/>• Tính tỷ lệ lỗi %F: =IF(G3=0,0,D3/G3)<br/>• Tính tỷ lệ bao phủ %Cover: =IF(G3=0,0,(C3+D3+E3)/G3)"]
        ST5["BƯỚC 5: TỔNG HỢP TOÀN DỰ ÁN & MÔI TRƯỜNG TEST<br/>• Dòng Total toàn dự án: =SUM(C3:C6), =IF(G7=0,0,C7/G7)<br/>• Lập bảng môi trường, đường dẫn APK/Web và tài khoản test"]
        ST3 --> ST4
        ST4 --> ST5
    end

    ST2 --> ST3
```

---

## 2. HƯỚNG DẪN CHI TIẾT TỪNG BƯỚC THỰC HIỆN

### Bước 1: Bóc tách ma trận kịch bản từ tài liệu SRS/TKCT
Dựa trên đặc tả 4 mục bắt buộc của từng chức năng trong SRS:
1. **Nhóm Giao diện (UI & RBAC):** Kiểm tra hiển thị mặc định, kiểm tra quyền truy cập menu/nút, kiểm tra bộ lọc và phân trang.
2. **Nhóm Luồng Thành công (Happy Path):** Nhập đúng dữ liệu, xác thực OTP/ký số thành công, dữ liệu ghi vào CSDL đúng trạng thái (`status = APPROVED`/`PROCESSING`).
3. **Nhóm Ràng buộc Dữ liệu (Validation):** Bỏ trống trường bắt buộc `*`, nhập sai định dạng SĐT/Email, số tiền = 0 hoặc âm, kiểm tra hiển thị lỗi inline.
4. **Nhóm Trường hợp Biên & Bẫy Toàn vẹn:** Trùng mã định danh, thao tác nút Quay lại (Back), Hủy giao dịch (Cancel), timeout phiên làm việc.

### Bước 2: Soạn thảo chi tiết các Sheet kịch bản theo Module
Tạo các sheet tương ứng với từng kênh giao tiếp của dự án:
* `App EU`: Kịch bản ứng dụng di động cho Khách hàng cuối.
* `App AM`: Kịch bản ứng dụng di động cho Đại lý / Nhân viên kinh doanh.
* `USSD`: Kịch bản tra cứu và thanh toán qua cú pháp USSD (`*202*...#`).
* `CMS`: Kịch bản Quản trị Web Admin (danh sách, chi tiết, duyệt, xóa, báo cáo).

### Bước 3: Thiết lập hệ thống công thức KPI tự động tại từng Sheet
Tại mỗi sheet kịch bản (ví dụ `App AM`, dòng kịch bản từ dòng 13 đến 100):
1. **Cột A (Mã TC tự động sinh):**
   `=IF(AND(E13="",E13=""),"",$F$3&"_"&ROW()-12-COUNTBLANK($E$13:E13))`
2. **Khối Header KPI tự động:**
   * Ô `F4` (Số TC đạt `P`): `=COUNTIF($N$13:$N$100,"P")`
   * Ô `F5` (Số TC không đạt `F`): `=COUNTIF($N$13:$N$100,"F")`
   * Ô `F6` (Số TC đang xem xét `PE`): `=COUNTIF($N$13:$N$100,"PE")`
   * Ô `F7` (Số TC chưa test): `=F8-F4-F5-F6`
   * Ô `F8` (Tổng số TC): `=COUNTA($F$13:$F$100)`

### Bước 4: Thiết lập Sheet `Tổng hợp` (Dashboard Điều Hành)
Tại Sheet `Tổng hợp`:
1. **Dòng 3 (Module 1 - App AM):**
   * Tên chức năng (B3): `='App AM'!F2`
   * Đạt (C3): `='App AM'!F4`
   * Không đạt (D3): `='App AM'!F5`
   * Đang xem xét (E3): `='App AM'!F6`
   * Chưa thực hiện (F3): `='App AM'!F7`
   * Tổng số TC (G3): `='App AM'!F8`
   * Tỉ lệ đạt (%P) (H3): `=IF(G3=0,0,C3/G3)`
   * Tỉ lệ không đạt (%F) (I3): `=IF(G3=0,0,D3/G3)`
   * Tỉ lệ đã thực hiện (%Cover) (J3): `=IF(G3=0,0,(C3+D3+E3)/G3)`
2. **Các dòng tiếp theo (App EU, USSD, CMS...):** Tương tự liên kết đến các sheet tương ứng.

### Bước 5: Dòng Tổng cộng Dự án và Khai báo Môi trường UAT
1. **Dòng Total (Dòng 7):**
   * Cột C..G: `=SUM(C3:C6)`
   * Cột H (%P toàn dự án): `=IF(G7=0,0,C7/G7)`
   * Cột I (%F toàn dự án): `=IF(G7=0,0,D7/G7)`
   * Cột J (%Cover toàn dự án): `=IF(G7=0,0,(C7+D7+E7)/G7)`
2. **Bảng Môi trường & Tài khoản kiểm thử:** Khai báo đầy đủ URL Web, link tải APK/TestFlight, tài khoản, mật khẩu, mã PIN cho từng vai trò.

---

## 3. TÀI NGUYÊN BỔ TRỢ

* [Quy chuẩn Kịch bản & Nghiệm thu UAT Viettel](file:///Users/micro/Source/docsbase/.agents/rules/viettel_uat_rules.md)
* [Biểu mẫu khung Kịch bản UAT và Dashboard hoàn chỉnh](./resources/uat_template_reference.md)
