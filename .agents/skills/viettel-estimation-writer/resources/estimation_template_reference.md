# TÀI LIỆU TRA CỨU ĐỊNH MỨC VÀ BIỂU MẪU CÔNG THỨC ƯỚC LƯỢNG VIETTEL

Tài liệu này cung cấp toàn bộ bảng tra cứu mã định mức nỗ lực (Man-Hours) chuẩn Viettel, các mẫu công thức Excel động và mẫu bảng tính sẵn sàng sử dụng.

---

## 1. BẢNG TRA CỨU TOÀN BỘ MÃ ĐỊNH MỨC VIETTEL (`DB function`)

### 1.1. Nhóm Dịch Vụ Backend & API (SERVICE - JAVA)
* `$M$7 = "Solution"`, `$N$7 = "Develop"`, `$O$7 = "Testing"`

| Mã loại chức năng (K) | Tên loại chức năng (L) | Tiêu chí phân loại độ phức tạp | Solution (M) | Develop (N) | Testing (O) | Tổng MH gốc (P) |
| :--- | :--- | :--- | :---: | :---: | :---: | :---: |
| `NVJ1-PTM` | Xử lý nghiệp vụ đơn giản phát triển mới | Logic < 5 bước, bảng đơn lẻ | 4 | 16 | 8 | **28** |
| `NVJ2-PTM` | Xử lý nghiệp vụ trung bình phát triển mới | Logic 5 - 10 bước, tích hợp 1-2 bảng/API | 7 | 23 | 14 | **44** |
| `NVJ3-PTM` | Xử lý nghiệp vụ phức tạp phát triển mới | Logic > 10 bước, xử lý tài chính, đối soát | 12 | 30 | 23 | **65** |
| `NVJ1-NC` | Nghiệp vụ đơn giản nâng cấp | Thêm/sửa < 5 bước | 1.69 | 3.01 | 3.16 | **7.86** |
| `NVJ2-NC` | Nghiệp vụ trung bình nâng cấp | Thêm/sửa 5 - 10 bước | 3.59 | 6.14 | 4.76 | **14.49** |
| `NVJ3-NC` | Nghiệp vụ phức tạp nâng cấp | Thêm/sửa > 10 bước | 5.96 | 11.31 | 14.86 | **32.13** |

### 1.2. Nhóm Giao Diện Web (UI - WEB)
| Mã loại chức năng (K) | Tên loại chức năng (L) | Tiêu chí phân loại độ phức tạp | Solution (M) | Develop (N) | Testing (O) | Tổng MH gốc (P) |
| :--- | :--- | :--- | :---: | :---: | :---: | :---: |
| `GD_WEB1` | Màn hình Web đơn giản (chỉ UI) | Dưới 10 thành phần/trường thông tin | 3 | 8 | 15 | **26** |
| `GD_WEB2` | Màn hình Web trung bình (chỉ UI) | Từ 10 - 20 trường thông tin, bộ lọc, bảng | 4 | 12 | 23 | **39** |
| `GD_WEB3` | Màn hình Web phức tạp (chỉ UI) | Trên 20 trường thông tin, modal nhiều bước | 6 | 16 | 31 | **53** |
| `CN_WEB1` | Web trọn gói UI + Service đơn giản | Dưới 10 component | 14 | 9 | 3.5 | **26.5** |
| `CN_WEB2` | Web trọn gói UI + Service trung bình| 10 - 20 component | 20 | 11.5 | 3.5 | **35** |
| `CN_WEB3` | Web trọn gói UI + Service phức tạp | Trên 20 component | 28 | 18 | 5 | **51** |
| `CN_WEB_KT` | Chức năng kéo thả (Drag & Drop Diagram)| Entity Diagram, liên kết nhiều dịch vụ | 8 | 48 | 16 | **72** |
| `GD1_CUT` | Cắt style CSS/HTML đơn giản | < 10 trường thông tin | 1.2 | 0 | 1.2 | **2.4** |
| `GD2_CUT` | Cắt style CSS/HTML phức tạp | Cắt toàn màn hình (menu, banner, footer) | 4 | 0 | 2 | **6** |

### 1.3. Nhóm Ứng Dụng Di Động (MOBILE)
| Mã loại chức năng (K) | Tên loại chức năng (L) | Tiêu chí phân loại độ phức tạp | Solution (M) | Develop (N) | Testing (O) | Tổng MH gốc (P) |
| :--- | :--- | :--- | :---: | :---: | :---: | :---: |
| `GD_MOBILE1` | Giao diện di động đơn giản | < 5 trường thông tin | 2.25 | 4 | 3.5 | **9.75** |
| `GD_MOBILE2` | Giao diện di động trung bình | 5 - 10 trường thông tin | 6.5 | 8 | 9 | **23.5** |
| `GD_MOBILE3` | Giao diện di động phức tạp | > 10 trường thông tin, chụp ảnh, scan QR | 12 | 17 | 16.5 | **45.5** |
| `CN_MOBILE Client1` | Xử lý Client di động đơn giản | < 5 trường thông tin | 4 | 8 | 4 | **16** |
| `CN_MOBILE Client2` | Xử lý Client di động trung bình | 5 - 10 trường thông tin, gọi SDK | 8 | 17.5 | 10.5 | **36** |
| `CN_MOBILE Client3` | Xử lý Client di động phức tạp | > 10 trường thông tin, xử lý luồng trọn gói | 12 | 28 | 16.8 | **56.8** |
| `CN_MOBILE Server1` | Dịch vụ Server cho Di động đơn giản | Xử lý logic < 5 bước | 4 | 7.5 | 4 | **15.5** |
| `CN_MOBILE Server2` | Dịch vụ Server cho Di động trung bình| Xử lý logic 5 - 10 bước | 8 | 14.8 | 9 | **31.8** |
| `CN_MOBILE Server3` | Dịch vụ Server cho Di động phức tạp| Xử lý logic > 10 bước | 15 | 26 | 18 | **59** |

### 1.4. Nhóm Báo Cáo & Danh Mục (REPORT & CATALOG)
| Mã loại chức năng (K) | Tên loại chức năng (L) | Tiêu chí phân loại độ phức tạp | Solution (M) | Develop (N) | Testing (O) | Tổng MH gốc (P) |
| :--- | :--- | :--- | :---: | :---: | :---: | :---: |
| `BC1` | Thiết kế báo cáo đơn giản | < 10 trường cột, không công thức | 6 | 7 | 6 | **19** |
| `BC2` | Thiết kế báo cáo trung bình | 10 - 20 trường cột, có công thức | 10 | 10 | 14 | **34** |
| `BC3` | Thiết kế báo cáo phức tạp | > 20 trường cột, phân tích đa chiều | 16 | 24 | 24 | **64** |
| `DM1` | Danh mục đơn giản | Không tham chiếu khóa ngoại | 1.5 | 3 | 3.5 | **8** |
| `DM2` | Danh mục trung bình | Có 1 - 3 bảng tham chiếu khóa ngoại | 4.5 | 9 | 7.5 | **21** |
| `DM3` | Danh mục phức tạp | Có trên 3 bảng tham chiếu khóa ngoại | 6 | 16 | 16 | **38** |
| `DP_IMP1/2/3` | Import dữ liệu từ tệp | Đơn giản / Trung bình / Phức tạp | 4 / 7.5 / 11 | 4 / 12 / 16 | 3.5 / 7 / 10.5 | **11.5 / 26.5 / 37.5** |
| `DP_AGG1/2/3` | Batch Job / Tổng hợp dữ liệu | Đơn giản / Trung bình / Phức tạp | 6 / 8.5 / 12 | 6 / 16 / 24 | 5.5 / 9 / 12.5 | **17.5 / 33.5 / 48.5** |

---

## 2. MẪU DÒNG DỮ LIỆU BẢNG TÍNH `Functional effort` (DÒNG 8 ĐẾN 10)

```csv
STT,Function name,Type,Function List,Function description,Solution_MH_Reuse,Develop_MH_Reuse,Testing_MH_Reuse,Total_MH_Reuse,,Function_code,Function_type_name,Solution_MH_Base,Develop_MH_Base,Testing_MH_Base,Total_MH_Base,Reuse_Rate,Reuse_MH,Reuse_Source,Note
1,CMS,Merchant Management,Web UI: Merchant list screen,Develop frontend views to display a table of all registered merchants.,=M8*(1-Q8),=N8*(1-Q8),=O8*(1-Q8),=SUM(F8:H8),,GD_WEB2,=VLOOKUP(K8,'Defines the type of function'!$B$5:$C$75,2,FALSE),=VLOOKUP(K8&$M$7,'DB function'!$D$6:$E$180,2,FALSE),=VLOOKUP(K8&$N$7,'DB function'!$D$6:$E$180,2,FALSE),=VLOOKUP(K8&$O$7,'DB function'!$D$6:$E$180,2,FALSE),=SUM(M8:O8),0,0,,
2,CMS,Merchant Management,API: Get Merchant list,Provide REST API to fetch paginated merchant data.,=M9*(1-Q9),=N9*(1-Q9),=O9*(1-Q9),=SUM(F9:H9),,NVJ2-PTM,=VLOOKUP(K9,'Defines the type of function'!$B$5:$C$75,2,FALSE),=VLOOKUP(K9&$M$7,'DB function'!$D$6:$E$180,2,FALSE),=VLOOKUP(K9&$N$7,'DB function'!$D$6:$E$180,2,FALSE),=VLOOKUP(K9&$O$7,'DB function'!$D$6:$E$180,2,FALSE),=SUM(M9:O9),0,0,,
3,App EU,Scan QR Payment,App UI: Confirm payment screen,Develop mobile app screens for payment confirmation and PIN entry.,=M10*(1-Q10),=N10*(1-Q10),=O10*(1-Q10),=SUM(F10:H10),,GD_MOBILE2,=VLOOKUP(K10,'Defines the type of function'!$B$5:$C$75,2,FALSE),=VLOOKUP(K10&$M$7,'DB function'!$D$6:$E$180,2,FALSE),=VLOOKUP(K10&$N$7,'DB function'!$D$6:$E$180,2,FALSE),=VLOOKUP(K10&$O$7,'DB function'!$D$6:$E$180,2,FALSE),=SUM(M10:O10),0,0,,
```
