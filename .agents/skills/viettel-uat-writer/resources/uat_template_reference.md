# BIỂU MẪU KHUNG KỊCH BẢN VÀ BIÊN BẢN NGHIỆM THU UAT VIETTEL

Tài liệu này cung cấp cấu trúc bảng tính chuẩn, mẫu kịch bản chi tiết và toàn bộ công thức Excel động áp dụng cho nghiệm thu UAT các dự án Viettel.

---

## 1. SHEET `Tổng hợp`: DASHBOARD TỔNG HỢP TOÀN BỘ DỰ ÁN

```csv
TỔNG HỢP KẾT QUẢ,,,,,,,,,
STT,Tên màn hình/chức năng,Số trường hợp kiểm thử đạt (P),Số trường hợp kiểm thử không đạt (F),Số trường hợp kiểm thử đang xem xét (PE),Số trường hợp kiểm thử chưa thực hiện,Tổng số trường hợp kiểm thử,Tỉ lệ trường hợp kiểm thử đạt (%P),Tỉ lệ trường hợp kiểm thử không đạt (%F),Tỉ lệ trường hợp kiểm thử đã thực hiện (%Cover)
1.0,='App AM'!F2,='App AM'!F4,='App AM'!F5,='App AM'!F6,='App AM'!F7,='App AM'!F8,=IF(G3=0,0,C3/G3),=IF(G3=0,0,D3/G3),=IF(G3=0,0,(C3+D3+E3)/G3)
2.0,='App EU'!F2,='App EU'!F4,='App EU'!F5,='App EU'!F6,='App EU'!F7,='App EU'!F8,=IF(G4=0,0,C4/G4),=IF(G4=0,0,D4/G4),=IF(G4=0,0,(C4+D4+E4)/G4)
3.0,=USSD!F2,=USSD!F4,=USSD!F5,=USSD!F6,=USSD!F7,=USSD!F8,=IF(G5=0,0,C5/G5),=IF(G5=0,0,D5/G5),=IF(G5=0,0,(C5+D5+E5)/G5)
4.0,='CMS'!C2,='CMS'!C4,='CMS'!C5,='CMS'!C6,='CMS'!C7,='CMS'!C8,=IF(G6=0,0,C6/G6),=IF(G6=0,0,D6/G6),=IF(G6=0,0,(C6+D6+E6)/G6)
Total,,=SUM(C3:C6),=SUM(D3:D6),=SUM(E3:E6),=SUM(F3:F6),=SUM(G3:G6),=IF(G7=0,0,C7/G7),=IF(G7=0,0,D7/G7),=IF(G7=0,0,(C7+D7+E7)/G7)
```

### Bảng Thông Tin Môi Trường Kiểm Thử (Dưới Dashboard):
```text
CMS Admin:  URL: http://10.228.37.65:8990  | User: admin        | Pass: admin123
App EU:     Link APK Google Drive          | User: 50942416176  | Pass: 1111     | PIN: 336699
App AM:     Link APK Google Drive          | User: 50940825132  | Pass: 12345aA@
USSD Gate:  IP: 10.228.47.19:8204          | Cú pháp: *202*8*<Code>*<Amount>*<PIN>#
```

---

## 2. SHEET KỊCH BẢN CHI TIẾT (`App AM`, `App EU`, `CMS`)

### 2.1. Khối Header Thống Kê (Dòng 1 đến 8)
```text
Dòng 1: TEST CASE
Dòng 2: Tên màn hình/Tên chức năng: [Tên Module / Phân hệ] (Ví dụ: App AM - Đăng ký Shop)
Dòng 3: Mã testcase: TC
Dòng 4: Số testcase đạt (P):         =COUNTIF($N$13:$N$100, "P")
Dòng 5: Số testcase không đạt (F):     =COUNTIF($N$13:$N$100, "F")
Dòng 6: Số testcase đang xem xét (PE): =COUNTIF($N$13:$N$100, "PE")
Dòng 7: Số testcase chưa test:         =F8-F4-F5-F6
Dòng 8: Tổng số testcase:              =COUNTA($F$13:$F$100)
```

### 2.2. Khối Danh Sách Kịch Bản (Dòng 10 trở đi)
* **Dòng 10 (Header cột):** `Mã trường hợp kiểm thử | Mục đích kiểm thử | Trường hợp kiểm thử | Data test | Các bước thực hiện | Kết quả mong muốn | Ảnh | Android (Lần 1..3) | iOS (Lần 1..3) | Kết quả hiện tại | Ghi chú`

* **Mẫu dòng kịch bản dữ liệu:**

```csv
Mã TC,Mục đích kiểm thử,Trường hợp kiểm thử,Data test,Các bước thực hiện,Kết quả mong muốn,Android_1,iOS_1,Kết quả hiện tại,Ghi chú
"=IF(AND(E13="""",E13=""""),"""",$F$3&""_""&ROW()-12-COUNTBLANK($E$13:E13))",Mở chức năng My Shop,Tài khoản đã KYC thành công,Role: Agent,"Step 1: Mở ứng dụng Natcash
Step 2: Chọn chức năng My Shop",Chuyển tới màn hình OnBoarding – Giới thiệu đăng ký Merchant,P,P,P,
"=IF(AND(E14="""",E14=""""),"""",$F$3&""_""&ROW()-12-COUNTBLANK($E$13:E14))",Nhập số điện thoại merchant mới,SĐT chưa từng đăng ký merchant,SĐT: 50935793147,"Step 1: Mở màn hình Active QR
Step 2: Nhập SĐT merchant mới
Step 3: Nhấn [Continue]",Chuyển tới màn hình nhập thông tin chi tiết Merchant,P,P,P,
"=IF(AND(E15="""",E15=""""),"""",$F$3&""_""&ROW()-12-COUNTBLANK($E$13:E15))",Bỏ trống trường bắt buộc,Bỏ trống tên cửa hàng,ShopName: rỗng,"Step 1: Để trống [Shop name]
Step 2: Nhấn [Continue]",Hiển thị thông báo lỗi inline: "Vui lòng nhập tên cửa hàng",P,P,P,
"=IF(AND(E16="""",E16=""""),"""",$F$3&""_""&ROW()-12-COUNTBLANK($E$13:E16))",Quét mã QR đã bị khóa,Mã QR có status = LOCK,Mã QR: 567851,"Step 1: Quét mã QR bị khóa
Step 2: Nhấn xác nhận",Hiển thị thông báo lỗi: "Mã QR đã bị khóa không thể giao dịch",P,P,P,
```
