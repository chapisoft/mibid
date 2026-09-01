# Phân tích Chi tiết: User Stories & Use Cases (Cập nhật End-to-End)

Tài liệu này đi sâu vào phân tích các Actor (Người dùng/Vai trò), Use Cases (Luồng sử dụng) và User Stories (Câu chuyện người dùng) để làm rõ yêu cầu nghiệp vụ cho phần mềm quản lý gói thầu XNK tinh gọn.

## 1. Định nghĩa Vai trò (Actors)

Hệ thống xoay quanh sự tương tác của 7 nhóm người dùng/tác nhân chính:

1.  **Client / Investor (Khách hàng / Chủ đầu tư):** Tác nhân khởi tạo toàn bộ quy trình. Là người phát hành Hồ sơ mời thầu (RFP/Tender), nhận Hồ sơ dự thầu từ công ty, công bố kết quả và nghiệm thu hàng hóa. *(Có thể không thao tác trực tiếp trên hệ thống, nhưng là điểm bắt đầu và kết thúc của luồng dữ liệu).*
2.  **Sales/Bidding Exec (Nhân viên Bán hàng/Đấu thầu):** Người tiếp nhận yêu cầu từ Client, tạo Thẻ hồ sơ thầu, yêu cầu giá đầu vào từ phòng Sourcing, và đóng gói Hồ sơ dự thầu nộp cho Client.
3.  **Purchaser (Nhân viên Mua hàng/Sourcing):** Người tìm kiếm nguồn hàng, tạo Yêu cầu báo giá (RFQ) dựa trên yêu cầu của gói thầu và làm việc với các nhà cung cấp.
4.  **Vendor (Nhà cung cấp):** Đối tác cung cấp hàng hóa (thường ở nước ngoài). Ưu tiên trải nghiệm không chạm (nhận Magic Link báo giá).
5.  **Logistics Exec (Nhân viên Vận hành):** Người theo dõi lịch trình giao hàng từ Vendor về giao cho Client, làm việc với hãng tàu/forwarder.
6.  **Forwarder (Đơn vị Vận tải):** Đối tác cung cấp dịch vụ vận tải, làm thủ tục hải quan.
7.  **Manager (Quản lý/Giám đốc):** Người phê duyệt chi phí mua hàng (Vendor) và giá bán (Bid Price) trước khi nộp cho Client.

---

## 2. Luồng Nghiệp Vụ Tổng Thể (End-to-End Workflow)

Sự tham gia của **Client** kết nối 3 phân hệ của hệ thống thành một chuỗi cung ứng liền mạch (Từ lúc đi đấu thầu -> Tìm nguồn hàng -> Giao hàng):

1.  **Khởi tạo (Client -> Sales):** Client phát hành thông báo mời thầu. Sales tạo một Thẻ "Hồ sơ thầu dự án A" trên bảng Kanban.
2.  **Tìm nguồn hàng (Sales -> Purchaser -> Vendor):** Sales yêu cầu Purchaser tìm giá đầu vào cho các mặt hàng trong gói thầu. Purchaser dùng tính năng **Sourcing & Magic Link** để lấy báo giá từ các Vendor.
3.  **Chốt giá & Nộp thầu (Purchaser -> Manager -> Sales -> Client):** Hệ thống tạo Bảng so sánh (Comparison Matrix) các Vendor. Manager duyệt Vendor tối ưu. Sales lấy giá vốn đó, cộng biên độ lợi nhuận, dùng "Kho tài liệu thông minh" đóng gói Hồ sơ thầu nộp cho Client.
4.  **Kết quả & Vận hành (Client -> Logistics -> Forwarder):** Client thông báo Trúng thầu. Thẻ Kanban chuyển sang trạng thái "Won". Hệ thống trigger phân hệ **Operations**. Logistics Exec mở Chat-room làm việc với Vendor (đặt hàng) và Forwarder (chở hàng) để giao cho Client đúng hạn.

---

## 3. Phân hệ 1: Quản lý Hồ sơ thầu đi Bán hàng (Bidding)

### Use Cases (Luồng nghiệp vụ)
*   **UC1.1: Tiếp nhận Yêu cầu:** Nhập thông tin gói thầu từ Client (Tên dự án, Hạn nộp, Yêu cầu kỹ thuật).
*   **UC1.2: Quản lý Kho tài liệu (Smart Repository):** Nơi lưu trữ có phân loại các giấy tờ pháp lý công ty.
*   **UC1.3: Quản lý Pipeline (Kanban):** Kéo thả Thẻ hồ sơ thầu qua các trạng thái (Chuẩn bị -> Xin giá mua -> Lắp ráp hồ sơ -> Đã nộp Client -> Chờ kết quả -> Trúng/Trượt).

### User Stories
*   **US1.1:** Là một *Sales Exec*, tôi muốn tạo một Thẻ Hồ sơ thầu ghi rõ Hạn chót nộp bài của Chủ đầu tư (Client) để tôi và team Sourcing biết được áp lực thời gian.
*   **US1.2:** Là một *Sales Exec*, tôi muốn link Thẻ Hồ sơ thầu này với một Yêu cầu báo giá (RFQ) gửi cho phòng Sourcing để họ tìm giá vốn cho tôi.
*   **US1.3:** Là một *Sales Exec*, tôi muốn kéo/thả tài liệu từ Kho năng lực công ty vào thẻ để đóng gói file dự thầu nộp cho Client.

---

## 4. Phân hệ 2: Sourcing & Báo giá tối giản (Purchasing) - MVP

### Use Cases (Luồng nghiệp vụ)
*   **UC2.1: Tạo RFQ từ Yêu cầu của Sales:** Purchaser nhận yêu cầu từ Sales, tạo RFQ.
*   **UC2.2: Gửi Magic Link cho Vendor.**
*   **UC2.3: Thu thập báo giá từ Vendor (Không login).**
*   **UC2.4: Bóc tách dữ liệu AI (AI OCR).**
*   **UC2.5: Ma trận so sánh & Phê duyệt.**

### User Stories
*   **US2.1:** Là một *Vendor*, tôi muốn nhận Magic Link và báo giá trực tiếp để tôi không mất thời gian.
*   **US2.2:** Là một *Manager*, tôi muốn hệ thống tự động sinh ra Ma trận so sánh giữa các Vendor để tôi chốt giá vốn tốt nhất, làm cơ sở cho Sales lên giá thầu nộp Client.

---

## 5. Phân hệ 3: Vận hành & Logistics (Operations)

### Use Cases (Luồng nghiệp vụ)
*   **UC3.1: Trigger Vận hành:** Khi Client báo "Trúng thầu", chuyển trạng thái sang Vận hành giao hàng.
*   **UC3.2: Chat-room theo ngữ cảnh:** Phòng chat 3 bên (DN - Vendor - Forwarder) xử lý lô hàng về.
*   **UC3.3: Milestone Tracking:** Cảnh báo các mốc thời gian giao hàng cho Client.

### User Stories
*   **US3.1:** Là một *Logistics Exec*, tôi muốn hệ thống tự động báo lịch giao hàng (Delivery Date) đã cam kết với Client để tôi hối thúc Vendor và Forwarder không bị trễ hạn.
