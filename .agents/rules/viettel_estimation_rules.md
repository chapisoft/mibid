# QUY CHUẨN VÀ NGUYÊN TẮC ƯỚC LƯỢNG NỖ LỰC PHẦN MỀM (VIETTEL ESTIMATION)

Tài liệu này quy định hệ thống nguyên tắc, quy chuẩn cấu trúc bảng tính, danh mục mã loại chức năng và phương pháp tính toán ước lượng nỗ lực (Effort Estimation) bắt buộc áp dụng cho các dự án phần mềm theo tiêu chuẩn và định mức của Tập đoàn Viettel.

---

## 1. NGUYÊN TẮC CỐT LÕI VÀ BẢO TOÀN CÔNG THỨC EXCEL

* **Nguyên tắc Bảo toàn 100% Công thức Động (Zero Hardcoded Values in Calculations):**
  * Mọi bảng tính ước lượng nỗ lực Viettel bắt buộc phải sử dụng công thức Excel liên kết động giữa các ô và các trang bảng tính (Sheets).
  * **Tuyệt đối CẤM thay thế công thức bằng giá trị số học trực tiếp (Hardcode).** Toàn bộ các chỉ số định mức, nỗ lực sau tái sử dụng, tổng nỗ lực theo vai trò và quy đổi Man-Days / Man-Months phải được tính toán tự động qua hàm `VLOOKUP`, `SUM`, `PRODUCT`, phép chia `/8` và `/22`.
* **Định mức chuẩn 3 tầng độc lập (Solution – Develop – Testing):**
  * Nỗ lực của từng chức năng được bóc tách định mức độc lập theo 3 giai đoạn:
    * *Giải pháp (Solution):* Khảo sát, phân tích yêu cầu (PTYC), thiết kế tổng thể, thiết kế chi tiết (TKCT) và thiết kế cơ sở dữ liệu.
    * *Phát triển (Develop):* Lập trình mã nguồn (Coding), xây dựng Unit Test và sửa lỗi nội bộ (Fixbug).
    * *Kiểm thử (Testing):* Viết kịch bản kiểm thử (KBKT), phê duyệt kịch bản, thực thi kiểm thử, quản lý lỗi và viết tài liệu hướng dẫn sử dụng (HDSD).
* **Quy chuẩn đơn vị đo lường và Quy đổi nỗ lực:**
  * `1 Man-Day (MD) = 8 Man-Hours (MH)`.
  * `1 Man-Month (MM) = 22 Man-Days (MD) = 176 Man-Hours (MH)`.

---

## 2. CẤU TRÚC BẢNG TÍNH ƯỚC LƯỢNG NỖ LỰC VIETTEL (WORKBOOK STRUCTURE)

Một bộ tài liệu ước lượng nỗ lực chuẩn Viettel hoàn chỉnh bắt buộc phải có đầy đủ các Sheet sau:

```text
Tập tin Bảng tính Ước lượng Nỗ lực (Viettel_Effort_Estimation.xlsx)
├── Sheet 1: Cover page (Trang bìa & Bảng ký duyệt 3 cấp)
├── Sheet 2: Table recognized documentchange (Bảng ghi nhận lịch sử thay đổi)
├── Sheet 3: General (Bảng tổng hợp nỗ lực dự án cấp cao)
├── Sheet 4: Functional effort (Danh mục bóc tách chức năng & Tính nỗ lực chi tiết)
├── Sheet 5: Non-functional effort (Bảng ước lượng nỗ lực phi chức năng)
├── Sheet 6: Defines the type of function (Bảng từ điển mã loại chức năng & tiêu chí độ phức tạp)
├── Sheet 7: DB function (Bảng cơ sở dữ liệu định mức nỗ lực chức năng MH)
├── Sheet 8: DB non-function (Bảng cơ sở dữ liệu định mức phi chức năng)
└── Sheet 9: Guide software reuse (Quy định 5 bước thẩm định tỷ lệ tái sử dụng)
```

---

## 3. CHI TIẾT TỪNG SHEET VÀ HỆ THỐNG CÔNG THỨC BẮT BUỘC

### 3.1. Sheet `Cover page` (Trang bìa & Ký duyệt Quản trị)
* **Ô `A7`:** Tên dự án chuẩn (ví dụ: `NATCASH_ULNL_Template`, `VTS_CORE_PAYMENT_ESTIMATION`).
* **Ô `C12:E12`:** Mã dự án / Mã yêu cầu (`Project code / code required`).
* **Ô `C13:E13`:** Mã tài liệu (`Document code`).
* **Ô `C14:E14`:** Số lần ước lượng (`Estimated times`: `Lần 1`, `Lần 2`...).
* **Bảng ký duyệt 3 tầng chuẩn Viettel:**
  * *Người lập (The establishment):* Họ tên, Chức vụ, Ngày lập.
  * *Người thẩm định / Kiểm tra (Auditor):* Họ tên, Chức vụ, Ngày kiểm tra.
  * *Người phê duyệt (Approver):* Họ tên, Chức vụ, Ngày duyệt.

### 3.2. Sheet `General` (Bảng Tổng Hợp Nỗ Lực Cấp Cao)
Bảng tổng hợp tự động lấy số liệu từ `Cover page`, `Functional effort` và `Non-functional effort`:

| Ô | Hạng mục công việc | Diễn giải nghiệp vụ | Công thức Excel bắt buộc |
| :---: | :--- | :--- | :--- |
| **A3** | Tên dự án | Tự động lấy tên dự án từ trang bìa | `='Cover page'!A7:I7` |
| **E9** | Nỗ lực chức năng chưa tái sử dụng | Tổng nỗ lực nguyên bản (Solution + Dev + Test) quy đổi sang MD | `='Functional effort'!P_TOTAL/8` |
| **E10** | • Nỗ lực Giải pháp (Solution) | Nỗ lực PTYC, thiết kế tổng thể, TKCT sang MD | `='Functional effort'!M_TOTAL/8` |
| **E11** | • Nỗ lực Phát triển (Develop) | Nỗ lực lập trình mã nguồn, Unit Test sang MD | `='Functional effort'!N_TOTAL/8` |
| **E12** | • Nỗ lực Kiểm thử (Testing) | Nỗ lực viết kịch bản, kiểm thử, viết HDSD sang MD | `='Functional effort'!O_TOTAL/8` |
| **E13** | Tổng nỗ lực chức năng sau tái sử dụng | Tổng nỗ lực sau khi đã giảm trừ tỷ lệ tái sử dụng sang MD | `='Functional effort'!I_TOTAL/8` |
| **E14** | Nỗ lực phi chức năng | Quản trị dự án, Sizing, Upcode, Deploy, Đào tạo sang MD | `='Non-functional effort'!D_TOTAL/8` |
| **E15** | Tổng nỗ lực toàn dự án (MD) | Tổng nỗ lực thực thi sau tái sử dụng và phi chức năng (MD) | `=SUM(E13:E14)` |
| **G15** | Tổng nỗ lực quy đổi Man-Months (MM) | Tổng nỗ lực dự án quy đổi sang Man-Months (chia cho 22 ngày công) | `=E15/22` |

*(Trong đó `P_TOTAL`, `I_TOTAL`, `M_TOTAL`, `N_TOTAL`, `O_TOTAL` là địa chỉ ô tổng cộng tương ứng tại dòng Total của sheet Functional effort).*

### 3.3. Sheet `Functional effort` (Chi Tiết Ước Lượng Chức Năng 27 Cột)
Đây là bảng tính cốt lõi bóc tách từng màn hình, API, batch job, báo cáo của dự án. Cấu trúc các cột và công thức bắt buộc tại mỗi dòng dữ liệu (giả định từ dòng `8`):

| Cột | Tên trường | Ý nghĩa nghiệp vụ | Công thức Excel bắt buộc |
| :---: | :--- | :--- | :--- |
| **A** | STT | Số thứ tự tăng dần | `1, 2, 3...` |
| **B** | Function name | Tên phân hệ / Module (Design, CMS, App EU, App AM, Core) | Dữ liệu nhập |
| **C** | Type | Nhóm nghiệp vụ / Use Case | Dữ liệu nhập |
| **D** | Function List | Tên chức năng chi tiết (UI / API / Job / Report) | Dữ liệu nhập |
| **E** | Function description | Mô tả chi tiết logic và phạm vi xử lý | Dữ liệu nhập |
| **F** | Solution (MH sau tái sử dụng) | Nỗ lực giải pháp thực tế sau giảm trừ | `=M8*(1-Q8)` |
| **G** | Develop (MH sau tái sử dụng) | Nỗ lực phát triển thực tế sau giảm trừ | `=N8*(1-Q8)` |
| **H** | Testing (MH sau tái sử dụng) | Nỗ lực kiểm thử thực tế sau giảm trừ | `=O8*(1-Q8)` |
| **I** | Total effort (MH sau tái sử dụng)| Tổng nỗ lực 3 khâu sau giảm trừ | `=SUM(F8:H8)` |
| **K** | Function code | Mã loại chức năng chuẩn Viettel (xem mục 4) | Nhập mã (ví dụ: `NVJ2-PTM`, `GD_WEB2`) |
| **L** | Function type name | Tự động tra cứu tên loại chức năng | `=VLOOKUP(K8,'Defines the type of function'!$B$5:$C$75,2,FALSE)` |
| **M** | Solution (MH gốc) | Tự động tra cứu định mức Solution theo mã | `=VLOOKUP(K8&$M$7,'DB function'!$D$6:$E$180,2,FALSE)` *(với $M$7="Solution")* |
| **N** | Develop (MH gốc) | Tự động tra cứu định mức Develop theo mã | `=VLOOKUP(K8&$N$7,'DB function'!$D$6:$E$180,2,FALSE)` *(với $N$7="Develop")* |
| **O** | Testing (MH gốc) | Tự động tra cứu định mức Testing theo mã | `=VLOOKUP(K8&$O$7,'DB function'!$D$6:$E$180,2,FALSE)` *(với $O$7="Testing")* |
| **P** | Total effort (MH gốc) | Tổng nỗ lực định mức gốc chưa trừ tái sử dụng | `=SUM(M8:O8)` |
| **Q** | % Tái sử dụng | Tỷ lệ tái sử dụng từ 0% đến 80% | `0` hoặc `0.2`, `0.3`, `0.5`, `0.7` |
| **R** | Total effort reuse | Nỗ lực được giảm trừ nhờ tái sử dụng | `=P8*Q8` hoặc `=P8-I8` |
| **S** | Reuse from function/system | Nguồn tái sử dụng (hệ thống/module nào) | Diễn giải nguồn |
| **T** | Note | Ghi chú thêm về điều kiện thực thi | Ghi chú |

---

## 4. HỆ THỐNG MÃ ĐỊNH MỨC CHỨC NĂNG CHUẨN VIETTEL (`DB function`)

Bảng tra cứu định mức nỗ lực chuẩn (Man-Hours) cho các nhóm chức năng phổ biến:

| Nhóm kỹ năng | Mã loại chức năng | Tên loại chức năng | Tiêu chí phân loại độ phức tạp | Solution (MH) | Develop (MH) | Testing (MH) | Tổng MH gốc |
| :--- | :--- | :--- | :--- | :---: | :---: | :---: | :---: |
| **Dịch vụ Backend (Java / API)** | `NVJ1-PTM` | Nghiệp vụ đơn giản phát triển mới | Logic < 5 bước, bảng đơn lẻ | 4 | 16 | 8 | **28** |
| | `NVJ2-PTM` | Nghiệp vụ trung bình phát triển mới | Logic 5 - 10 bước, tích hợp 1-2 bảng/API | 7 | 23 | 14 | **44** |
| | `NVJ3-PTM` | Nghiệp vụ phức tạp phát triển mới | Logic > 10 bước, xử lý tài chính, đối soát, tích hợp nhiều cổng | 12 | 30 | 23 | **65** |
| | `NVJ1-NC` | Nghiệp vụ đơn giản nâng cấp | Sửa đổi/bổ sung < 5 bước | 1.69 | 3.01 | 3.16 | **7.86** |
| | `NVJ2-NC` | Nghiệp vụ trung bình nâng cấp | Sửa đổi/bổ sung 5 - 10 bước | 3.59 | 6.14 | 4.76 | **14.49** |
| | `NVJ3-NC` | Nghiệp vụ phức tạp nâng cấp | Sửa đổi/bổ sung > 10 bước | 5.96 | 11.31 | 14.86 | **32.13** |
| **Giao diện Web (UI Web)** | `GD_WEB1` | Màn hình Web đơn giản (chỉ UI) | Dưới 10 thành phần/trường thông tin | 3 | 8 | 15 | **26** |
| | `GD_WEB2` | Màn hình Web trung bình (chỉ UI) | Từ 10 - 20 trường thông tin, có bảng, bộ lọc | 4 | 12 | 23 | **39** |
| | `GD_WEB3` | Màn hình Web phức tạp (chỉ UI) | Trên 20 trường thông tin, biểu mẫu nhiều bước, modal | 6 | 16 | 31 | **53** |
| **Chức năng Web trọn gói (UI + API)** | `CN_WEB1` | Web trọn gói đơn giản | UI + API đơn giản (< 10 trường) | 14 | 9 | 3.5 | **26.5** |
| | `CN_WEB2` | Web trọn gói trung bình | UI + API trung bình (10 - 20 trường) | 20 | 11.5 | 3.5 | **35** |
| | `CN_WEB3` | Web trọn gói phức tạp | UI + API phức tạp (> 20 trường) | 28 | 18 | 5 | **51** |
| **Giao diện Di động (UI Mobile)** | `GD_MOBILE1` | Giao diện di động đơn giản | Dưới 5 trường thông tin | 2.25 | 4 | 3.5 | **9.75** |
| | `GD_MOBILE2` | Giao diện di động trung bình | Từ 5 - 10 trường thông tin | 6.5 | 8 | 9 | **23.5** |
| | `GD_MOBILE3` | Giao diện di động phức tạp | Trên 10 trường thông tin, eKYC, chụp ảnh, quét QR | 12 | 17 | 16.5 | **45.5** |
| **Chức năng Di động (Client / Server)** | `CN_MOBILE Client1` | Xử lý Client di động đơn giản | < 5 trường thông tin | 4 | 8 | 4 | **16** |
| | `CN_MOBILE Client2` | Xử lý Client di động trung bình | 5 - 10 trường thông tin, gọi SDK | 8 | 17.5 | 10.5 | **36** |
| | `CN_MOBILE Client3` | Xử lý Client di động phức tạp | > 10 trường thông tin, xử lý luồng trọn gói | 12 | 28 | 16.8 | **56.8** |
| | `CN_MOBILE Server1` | Dịch vụ Server cho Di động đơn giản | Xử lý logic < 5 bước | 4 | 7.5 | 4 | **15.5** |
| | `CN_MOBILE Server2` | Dịch vụ Server cho Di động trung bình| Xử lý logic 5 - 10 bước | 8 | 14.8 | 9 | **31.8** |
| | `CN_MOBILE Server3` | Dịch vụ Server cho Di động phức tạp| Xử lý logic > 10 bước | 15 | 26 | 18 | **59** |
| **Báo cáo (Report)** | `BC1` | Thiết kế báo cáo đơn giản | < 10 cột, không dùng công thức phức tạp | 6 | 7 | 6 | **19** |
| | `BC2` | Thiết kế báo cáo trung bình | 10 - 20 cột, có công thức tính toán | 10 | 10 | 14 | **34** |
| | `BC3` | Thiết kế báo cáo phức tạp | > 20 cột, tổng hợp đa chiều, đồ thị | 16 | 24 | 24 | **64** |
| **Danh mục (Catalog / Master Data)** | `DM1` | Danh mục đơn giản | Không có bảng tham chiếu khóa ngoại | 1.5 | 3 | 3.5 | **8** |
| | `DM2` | Danh mục trung bình | Có 1 - 3 bảng tham chiếu khóa ngoại | 4.5 | 9 | 7.5 | **21** |
| | `DM3` | Danh mục phức tạp | Có trên 3 bảng tham chiếu khóa ngoại | 6 | 16 | 16 | **38** |
| **Xử lý Dữ liệu Lô & Tổng hợp** | `DP_IMP1/2/3` | Xử lý Import dữ liệu từ tệp | Đơn giản / Trung bình / Phức tạp | 4 / 7.5 / 11 | 4 / 12 / 16 | 3.5 / 7 / 10.5 | **11.5 / 26.5 / 37.5** |
| | `DP_AGG1/2/3` | Xử lý Batch Job / Tổng hợp dữ liệu | Đơn giản / Trung bình / Phức tạp | 6 / 8.5 / 12 | 6 / 16 / 24 | 5.5 / 9 / 12.5 | **17.5 / 33.5 / 48.5** |

---

## 5. QUY ĐỊNH THẨM ĐỊNH TỶ LỆ TÁI SỬ DỤNG (`Guide software reuse`)

Tỷ lệ tái sử dụng (`Q` từ `0.0` đến `0.8`) được xác định dựa trên 6 tiêu chí thẩm định:
1. **Tái sử dụng Công nghệ & Framework:** Kế thừa khung kiến trúc dự án đã có (giảm trừ 10% - 20%).
2. **Tái sử dụng Tài liệu & Giải pháp:** Kế thừa hồ sơ thiết kế, quy trình nghiệp vụ tương đương (giảm trừ 10% - 30%).
3. **Tái sử dụng Cơ sở Dữ liệu & Mã nguồn:** Kế thừa lược đồ bảng, module xác thực, hàm tiện ích dùng chung (giảm trừ 20% - 50%).
4. **Tái sử dụng Nội bộ Hệ thống:** Các chức năng nhân bản tương đồng trong cùng một phân hệ (giảm trừ 30% - 70%).
5. **Năng lực & Kinh nghiệm Đội ngũ:** Đội ngũ đã thực hiện nghiệp vụ tương tự trên cùng ngăn xếp công nghệ (giảm trừ 10% - 20%).
6. **Mức tối đa:** Tổng tỷ lệ tái sử dụng của một chức năng không vượt quá `80%` (`Q ≤ 0.8`) để đảm bảo chất lượng kiểm thử và tích hợp.
