# TÀI LIỆU NGHIÊN CỨU & PHÁT TRIỂN SẢN PHẨM (PRODUCT R&D BLUEPRINT)
## NỀN TẢNG KHÔNG GIAN CỘNG TÁC SỐ QUẢN LÝ GÓI THẦU VÀ HỒ SƠ THẦU XUẤT NHẬP KHẨU: MIBID
### ĐỊNH VỊ: KHÔNG GIAN CỘNG TÁC SỐ TINH GỌN, XÓA BỎ RÀO CẢN KẾT NỐI GIỮA DOANH NGHIỆP THƯƠNG MẠI XNK, CHỦ ĐẦU TƯ VÀ NHÀ CUNG CẤP

---

## PHẦN 1: NGHIÊN CỨU THỊ TRƯỜNG, NỖI ĐAU DOANH NGHIỆP XNK VÀ KHOẢNG TRỐNG ERP

```mermaid
%%{init: {'flowchart': {'nodeSpacing': 8, 'rankSpacing': 140, 'padding': 3, 'curve': 'basis'}}}%%
flowchart LR
    %% GỐC ĐỊNH VỊ
    ROOT["ĐỊNH VỊ CHIẾN LƯỢC<br/>NỀN TẢNG MIBID"]:::cLevel0

    %% CÁC TRỤ CỘT ĐỊNH VỊ
    MOD1["1. ĐẶC THÙ NGHIỆP VỤ THƯƠNG MẠI XNK"]:::cLevel1
    MOD2["2. KHOẢNG TRỐNG CỦA HỆ THỐNG ERP"]:::cLevel1
    MOD3["3. MÔ HÌNH KHÔNG GIAN CỘNG TÁC SỐ"]:::cLevel1

    %% CHI TIẾT
    C1["1.1. Áp lực thời gian nộp thầu gấp gáp"]:::cLevel2
    C2["1.2. Mạng lưới nhà cung cấp quốc tế phân tán"]:::cLevel2
    C3["2.1. Quy trình phê duyệt ERP cồng kềnh"]:::cLevel2
    C4["2.2. Rào cản bắt buộc đối tác tạo tài khoản"]:::cLevel2
    C5["3.1. Cổng báo giá không chạm Magic Link"]:::cLevel2
    C6["3.2. Chốt chặn Gatekeeper bảo vệ hồ sơ thầu"]:::cLevel2

    %% LIÊN KẾT
    ROOT --> MOD1 & MOD2 & MOD3
    MOD1 --> C1 & C2
    MOD2 --> C3 & C4
    MOD3 --> C5 & C6

    classDef cLevel0 font-size:12px,font-weight:bold,padding:8px 20px;
    classDef cLevel1 font-size:11px,font-weight:bold,padding:6px 16px;
    classDef cLevel2 font-size:10px,padding:4px 12px;
```

### 1. Phân Tích Thực Trạng và Nỗi Đau Cốt Lõi Của Doanh Nghiệp Thương Mại XNK

Trong phân khúc doanh nghiệp Thương mại và Xuất nhập khẩu (XNK) vừa và nhỏ, hoạt động tham gia dự thầu và cung ứng hàng hóa cho các dự án công nghiệp, xây dựng hoặc chủ đầu tư tư nhân diễn ra với cường độ cao và áp lực cạnh tranh khốc liệt. Các doanh nghiệp này thường xuyên đối mặt với 4 điểm nghẽn nghiêm trọng:

1. **Rào cản tài khoản đối với Nhà cung cấp quốc tế (Vendor Friction):**
   * Khi cần lấy giá vốn cho hàng chục mặt hàng kỹ thuật, nhân viên mua hàng phải liên hệ với nhiều nhà cung cấp tại Trung Quốc, Hàn Quốc, Nhật Bản, châu Âu.
   * Các nhà cung cấp nước ngoài tuyệt đối từ chối việc đăng ký tài khoản, cài đặt phần mềm hoặc tuân theo các quy trình cổng thông tin phức tạp của bên mua. Hậu quả là 90% giao dịch hỏi giá bị đẩy về các kênh rời rạc như Email, WeChat, WhatsApp, Zalo.
2. **Dữ liệu báo giá phân mảnh và sai lệch quy chuẩn:**
   * Báo giá gửi về dưới vô số định dạng: bảng tính Excel không cùng mẫu, ảnh chụp, tệp PDF scan.
   * Khác biệt về đồng tiền thanh toán (USD, EUR, CNY, VND), điều kiện thương mại quốc tế Incoterms (EXW xưởng, FOB cảng đi, CIF cảng đến, DDP kho người mua), chưa tính thuế nhập khẩu, thuế giá trị gia tăng và chi phí kiểm định chuyên ngành.
   * Nhân viên mua hàng mất từ 2 đến 4 ngày làm việc thủ công để nhập liệu, quy đổi tỷ giá và ghép thành bảng so sánh giá, dẫn đến nguy cơ chậm thời hạn nộp hồ sơ thầu.
3. **Nguy cơ trượt thầu do sai sót hồ sơ kỹ thuật và pháp lý:**
   * Hồ sơ dự thầu đòi hỏi tập hợp hàng chục loại giấy tờ pháp lý: Đăng ký kinh doanh, báo cáo tài chính kiểm toán, giấy ủy quyền bán hàng của hãng, chứng chỉ xuất xứ hàng hóa CO, chứng chỉ chất lượng CQ, catalog kỹ thuật.
   * Do không có cơ chế chốt chặn tự động, nhân viên kinh doanh thường nộp hồ sơ thiếu giấy tờ bắt buộc hoặc sử dụng tài liệu đã hết hạn hiệu lực, dẫn đến việc bị loại ngay từ vòng chấm hồ sơ năng lực.
4. **Đứt gãy luồng thông tin giữa Đấu thầu, Mua hàng và Giao nhận Logistics:**
   * Sau khi trúng thầu, thông tin chi tiết về hợp đồng, thông số đóng gói và các mốc thời gian cam kết giao hàng không được chuyển giao thông suốt sang bộ phận Logistics.
   * Không có cơ chế cảnh báo tự động về thời hạn sẵn sàng hàng hóa tại xưởng người bán, thời điểm tàu chạy và thời điểm cập cảng, dẫn đến tình trạng phát sinh chi phí lưu container, lưu bãi và bị chủ đầu tư phạt vi phạm tiến độ giao hàng.

```mermaid
flowchart LR
    subgraph S_ERP ["HỆ THỐNG ERP TRUYỀN THỐNG (CỒNG KỀNH & QUAN LIÊU)"]
        direction TB
        ERP_DESC["CƠ CHẾ KIỂM SOÁT TĨNH:<br/>• Bắt buộc Vendor tạo tài khoản và cài đặt phần mềm<br/>• Luồng phê duyệt tài chính 5 đến 7 cấp cồng kềnh<br/>• Giao diện phức tạp, đòi hỏi đào tạo chuyên sâu<br/>• Chu kỳ triển khai kéo dài từ 6 tháng đến 1 năm"]
    end

    subgraph S_PAIN ["NỖI ĐAU THỰC TẾ CỦA DOANH NGHIỆP XNK VỪA VÀ NHỎ"]
        direction TB
        PAIN_DESC["⚡ ĐỘ TRỄ VÀ ĐỨT GÃY GIAO TIẾP HIỆN TRƯỜNG:<br/>• Hạn nộp thầu chỉ từ 3 đến 5 ngày<br/>• Báo giá phân mảnh qua Email, WeChat, Zalo, Excel<br/>• Rủi ro trượt thầu do thiếu giấy tờ CO/CQ, Catalog<br/>• Trễ hạn giao hàng do đứt gãy kết nối Logistics"]
    end

    subgraph S_MIBID ["KHÔNG GIAN CỘNG TÁC SỐ MIBID (TINH GỌN & KHÔNG CHẠM)"]
        direction TB
        MIBID_DESC["CƠ CHẾ THÚC ĐẨY LUỒNG CÔNG VIỆC:<br/>• Magic Link gửi báo giá 1 chạm, Vendor không cần login<br/>• Tự động quy đổi tỷ giá & sinh Ma trận so sánh giá<br/>• Bộ kiểm soát chuyển bước Gatekeeper khóa chặt hồ sơ<br/>• Tự động sinh công việc vi mô & cảnh báo mốc ETA/ETD"]
    end

    ERP_DESC -.->|Tạo ra độ trễ lớn| S_PAIN
    MIBID_DESC -->|Khắc phục triệt để| S_PAIN
```

---

### 2. Ma Trận So Sánh Năng Lực Giải Pháp

| Tiêu chí nghiệp vụ | Hệ thống ERP truyền thống (SAP, Odoo, Bravo) | Công cụ Quản lý Dự án (Trello, Jira, Asana) | Nền tảng Đấu thầu Nhà nước / Mua sắm lớn | **Nền tảng Mibid (Đề xuất)** |
| :--- | :--- | :--- | :--- | :--- |
| **Bản chất định vị** | Cỗ máy kiểm soát tài chính và sổ cái kế toán. | Bảng công việc và nhiệm vụ chung chung. | Cổng đấu thầu tuân thủ thủ tục hành chính công. | **Không gian cộng tác số chuyên sâu cho thương mại XNK.** |
| **Tương tác với Vendor** | Bắt buộc đối tác tạo tài khoản và phân quyền. | Không hỗ trợ tương tác thu thập giá từ đối tác ngoài. | Đòi hỏi chứng thư số, token USB, quy trình phức tạp. | **Không chạm qua Magic Link mã hóa JWT/PIN, không cần tài khoản.** |
| **So sánh giá đa ngoại tệ** | Phức tạp, chỉ hạch toán sau khi lập đơn mua hàng PO. | Không có tính năng tính toán so sánh tài chính. | So sánh giá tổng thầu, không bóc tách chi tiết dòng hàng. | **Tự động quy đổi tỷ giá, so sánh từng Line Item, Incoterms, thuế, cước.** |
| **Kiểm soát tính đầy đủ hồ sơ** | Phê duyệt hành chính tuần tự theo chức vụ. | Nhắc việc thủ công, không có điều kiện khóa bước. | Chấm điểm thủ công bởi tổ chấm thầu. | **Gatekeeper Engine chặn cứng hoặc cảnh báo nếu thiếu tài liệu chuẩn.** |
| **Quản lý tài liệu theo ngữ cảnh** | Lưu trữ tệp đính kèm rời rạc theo bản ghi. | Đính kèm file tự do, không kiểm soát phiên bản. | Đóng gói tệp nén dung lượng giới hạn. | **Kho DMS tập trung, kế thừa xuyên suốt từ Mua hàng đến Logistics.** |
| **Theo dõi vận chuyển quốc tế** | Phải mua thêm phân hệ Logistics đắt đỏ. | Người dùng tự gõ text cập nhật ngày tháng. | Không quản lý khâu giao nhận hàng hóa. | **Theo dõi mốc vận đơn BL, tự động cảnh báo trễ hạn ETA/ETD mỗi sáng.** |
| **Thời gian đưa vào sử dụng** | Từ 3 đến 9 tháng, chi phí tư vấn lớn. | 1 ngày nhưng phải cấu hình thủ công toàn bộ. | Phụ thuộc vào quy định cổng mua sắm công. | **Sử dụng ngay trong 1 tuần với các mẫu quy trình chuẩn hóa sẵn.** |

---

## PHẦN 2: ĐỊNH VỊ SẢN PHẨM VÀ GIÁ TRỊ CỐT LÕI

### 1. Định Vị: "Không Gian Cộng Tác Số" Thay Vì "Phần Mềm Quản Trị"

Sự khác biệt mang tính cách mạng của Mibid nằm ở việc **chuyển đổi tư duy từ kiểm soát quan liêu sang thúc đẩy luồng công việc tự nhiên**:
* **Không áp đặt quy trình nội bộ lên đối tác bên ngoài:** Nhà cung cấp và đơn vị vận chuyển được tương tác qua các giao diện web tối ưu cho di động với thời gian phản hồi dưới 60 giây.
* **Tập trung vào chuỗi giá trị sinh lời:** Tập trung xử lý xuất sắc khâu Đấu thầu (Bidding), Mua hàng (Sourcing) và Giao hàng (Logistics). Các nghiệp vụ kế toán sâu như hạch toán nợ có, khấu hao tài sản, tính thuế thu nhập doanh nghiệp sẽ được tích hợp với các phần mềm chuyên ngành thông qua RESTful API.

### 2. Ba Trụ Cột Giá Trị Cốt Lõi

1. **Tốc độ (Speed):** Rút ngắn 70% thời gian thu thập báo giá và lắp ráp hồ sơ dự thầu, giúp doanh nghiệp kịp thời chớp lấy các cơ hội kinh doanh gấp.
2. **Tinh gọn (Lean):** Loại bỏ 100% các biểu mẫu giấy tờ trung gian và các thao tác sao chép dữ liệu thủ công giữa các bộ phận.
3. **Kết nối không rào cản (Frictionless Connectivity):** Kết nối tức thì giữa Doanh nghiệp thương mại, Khách hàng, Nhà cung cấp quốc tế và Đơn vị vận chuyển trong một luồng dữ liệu thống nhất.

---

## PHẦN 3: PHÂN TÍCH 7 NHÓM TÁC NHÂN VÀ LUỒNG GIÁ TRỊ TOÀN TRÌNH

```mermaid
%%{init: {'flowchart': {'nodeSpacing': 8, 'rankSpacing': 140, 'padding': 3, 'curve': 'basis'}}}%%
flowchart LR
    %% GỐC TÁC NHÂN
    ROOT["7 NHÓM TÁC NHÂN HỆ THỐNG<br/>VÀ VAI TRÒ TƯƠNG TÁC"]:::cLevel0

    %% PHÂN NHÓM TÁC NHÂN
    MOD1["1. NHÓM KHÁCH HÀNG & LÃNH ĐẠO"]:::cLevel1
    MOD2["2. NHÓM KINH DOANH & MUA HÀNG"]:::cLevel1
    MOD3["3. NHÓM ĐỐI TÁC NGOÀI & VẬN HÀNH"]:::cLevel1

    %% CHI TIẾT TÁC NHÂN
    A1["1.1. Client: Chủ đầu tư phát hành yêu cầu"]:::cLevel2
    A2["1.2. Manager: Giám đốc phê duyệt chi phí & giá bán"]:::cLevel2
    A3["2.1. Sales: Tiếp nhận dự án, đóng gói hồ sơ thầu"]:::cLevel2
    A4["2.2. Purchaser: Lập RFQ, tìm kiếm nhà cung cấp"]:::cLevel2
    A5["3.1. Vendor: Nhà cung cấp báo giá qua Magic Link"]:::cLevel2
    A6["3.2. Logistics: Theo dõi tiến độ lô hàng & vận đơn"]:::cLevel2
    A7["3.3. Forwarder: Vận chuyển quốc tế & làm thủ tục"]:::cLevel2

    %% LIÊN KẾT
    ROOT --> MOD1 & MOD2 & MOD3
    MOD1 --> A1 & A2
    MOD2 --> A3 & A4
    MOD3 --> A5 & A6 & A7

    classDef cLevel0 font-size:12px,font-weight:bold,padding:8px 20px;
    classDef cLevel1 font-size:11px,font-weight:bold,padding:6px 16px;
    classDef cLevel2 font-size:10px,padding:4px 12px;
```

### 1. Chuỗi Giá Trị Toàn Trình (End-to-End Value Stream)

Quy trình nghiệp vụ của Mibid kết nối chặt chẽ từ khi tiếp nhận thông tin gói thầu cho đến khi bàn giao hàng hóa hoàn tất:

```mermaid
sequenceDiagram
    autonumber
    actor Client as Chủ Đầu Tư
    actor Sales as Nhân Viên Đấu Thầu
    actor Purchaser as Nhân Viên Mua Hàng
    actor Vendor as Nhà Cung Cấp
    actor Manager as Ban Giám Đốc
    actor Logistics as Nhân Viên Vận Hành
    actor Forwarder as Đơn Vị Vận Tải

    %% Khởi tạo gói thầu
    Note over Client,Sales: BƯỚC 1: TIẾP NHẬN YÊU CẦU VÀ KHỞI TẠO DỰ ÁN
    Client->>Sales: Phát hành hồ sơ mời thầu và danh mục hàng hóa
    Sales->>Sales: Tạo thẻ dự án trên bảng Kanban và gắn luồng quy trình chuẩn

    %% Mua hàng và lấy giá
    Note over Sales,Vendor: BƯỚC 2: TÌM NGUỒN CUNG VÀ THU THẬP BÁO GIÁ
    Sales->>Purchaser: Yêu cầu tìm nguồn cung ứng và lấy giá vốn
    Purchaser->>Purchaser: Lập yêu cầu báo giá RFQ bóc tách mã hàng hóa
    Purchaser->>Vendor: Gửi Magic Link báo giá trực tiếp qua thư điện tử
    Vendor->>Vendor: Truy cập đường dẫn không cần đăng nhập, điền đơn giá và tải tệp
    Vendor-->>Purchaser: Xác nhận nộp báo giá thành công

    %% So sánh giá và phê duyệt
    Note over Purchaser,Sales: BƯỚC 3: SO SÁNH GIÁ VỐN VÀ ĐÓNG GÓI HỒ SƠ DỰ THẦU
    Purchaser->>Manager: Trình Ma trận so sánh giá tự động quy đổi tỷ giá
    Manager->>Manager: Phê duyệt chọn báo giá tối ưu và đóng gói giá vốn
    Sales->>Sales: Kiểm tra chốt chặn Gatekeeper tài liệu năng lực và pháp lý
    Sales->>Client: Nộp hồ sơ dự thầu hoàn chỉnh đúng thời hạn

    %% Thực thi sau trúng thầu
    Note over Client,Forwarder: BƯỚC 4: THỰC THI HỢP ĐỒNG VÀ GIAO NHẬN HÀNG HÓA
    Client-->>Sales: Thông báo kết quả trúng thầu chính thức
    Sales->>Sales: Chuyển trạng thái thẻ dự án sang Vận hành
    Logistics->>Vendor: Kích hoạt đơn đặt hàng chính thức theo báo giá đã duyệt
    Logistics->>Forwarder: Đặt chỗ vận chuyển quốc tế và nhận mã vận đơn
    Forwarder-->>Logistics: Cập nhật tiến độ tàu chạy và dự kiến cập cảng
    Logistics->>Client: Bàn giao hàng hóa và chứng từ nghiệm thu hoàn thành
```

---

## PHẦN 4: NĂM PHÂN HỆ NGHIỆP VỤ ĐỘT PHÁ CỦA MIBID

```mermaid
flowchart LR
    subgraph S_CORE ["NỀN TẢNG LÕI VÀ BẢO MẬT"]
        direction TB
        M1["PHÂN HỆ 1: NỀN TẢNG SAAS, IAM & KHO DMS<br/>• Kiến trúc đa khách thuê cách ly dữ liệu<br/>• Phân quyền kết hợp RBAC và ABAC theo dự án<br/>• Quản lý tài liệu tập trung, kiểm soát phiên bản"]
        M2["PHÂN HỆ 2: WORKFLOW ENGINE & GATEKEEPER<br/>• Tùy biến các bước quy trình Kanban linh hoạt<br/>• Chốt chặn Gatekeeper kiểm tra tài liệu bắt buộc<br/>• Phân loại chốt chặn: Chặn cứng, Cảnh báo, Duyệt ngoại lệ"]
        M1 --> M2
    end

    subgraph S_BUSINESS ["NGHIỆP VỤ GIAO DỊCH VÀ VẬN HÀNH"]
        direction TB
        M3["PHÂN HỆ 3: MUA HÀNG & CỔNG MAGIC LINK<br/>• Quản lý RFQ chi tiết đến từng dòng hàng<br/>• Magic Link mã hóa JWT có thời hạn và mã bảo vệ PIN<br/>• Ma trận so sánh giá tự động quy đổi ngoại tệ"]
        M4["PHÂN HỆ 4: CÔNG VIỆC VI MÔ & HỒ SƠ THẦU<br/>• Tự động sinh danh mục công việc theo từng bước<br/>• Thiết lập hạn định thời gian và giám sát năng suất<br/>• Đóng gói hồ sơ dự thầu theo quy định của chủ đầu tư"]
        M5["PHÂN HỆ 5: THEO DÕI LÔ HÀNG & BÁO CÁO BI<br/>• Quản lý vận đơn, chi phí vận tải và thủ tục hải quan<br/>• Tự động cảnh báo vi phạm thời hạn giao hàng mỗi sáng<br/>• Báo cáo tỷ lệ trúng thầu và phân tích điểm nghẽn"]
        M3 --> M4
        M4 --> M5
    end

    M2 --> M3
```

1. **Phân hệ 1 — Quản trị Nền tảng SaaS, IAM và Kho Tài liệu Số (DMS):**
   * Bảo đảm mô hình đa khách thuê (Multi-tenant) cách ly dữ liệu an toàn.
   * Áp dụng mô hình phân quyền lai: Quyền toàn cục (RBAC) kết hợp quyền theo từng dự án (ABAC). Một nhân sự có thể là Trưởng nhóm tại dự án A nhưng chỉ là Thành viên hỗ trợ tại dự án B.
   * Quản lý kho tài liệu số tập trung, hỗ trợ lưu trữ tệp trên Amazon S3 / MinIO với đường dẫn truy cập có chữ ký tạm thời (Pre-signed URL) và quy trình phê duyệt tài liệu nghiêm ngặt.
2. **Phân hệ 2 — Dynamic Workflow Engine và Chốt Chặn Chuyển Bước Đa Tầng (Transition Gatekeeper):**
   * **Khả năng khai báo và tùy biến luồng cực kỳ linh hoạt:** Cho phép doanh nghiệp tự định nghĩa không giới hạn các mẫu quy trình chuẩn theo từng nhóm Chủ đầu tư (Khối Nhà nước EVN/PVN, Tổng thầu EPC, Dự án FDI quốc tế, Khách hàng Tư nhân) hoặc theo nhóm ngành hàng. Quản lý dự án có quyền ghi đè (Workflow Tailoring) riêng cho từng gói thầu cụ thể (thêm bước trung gian, bớt bước không cần thiết, rẽ nhánh có điều kiện theo ngân sách hoặc yêu cầu bảo lãnh) mà không làm ảnh hưởng tới mẫu quy trình gốc của công ty.
   * **Cơ chế chốt chặn Gatekeeper đa tầng bảo đảm vận hành chuẩn xác:** Tự động kiểm tra 4 lớp điều kiện nghiêm ngặt (Chứng từ logic AND/OR, Tiêu chí checklist bắt buộc, Điều kiện thương mại/tài chính, Ký duyệt cấp quản lý) trước khi cho phép kéo thẻ sang bước tiếp theo. Cung cấp 3 chế độ thực thi: Chặn cứng (Hard Stop), Cảnh báo mềm (Soft Warning) và Phê duyệt ngoại lệ (Manager Approval Bypass).
3. **Phân hệ 3 — Mua Hàng, Báo Giá và Cổng Không Chạm Magic Link:**
   * Tự động sinh đường dẫn truy cập duy nhất có gắn mã bảo mật JWT với thời hạn hiệu lực cụ thể gửi thẳng tới hộp thư của từng nhà cung cấp.
   * Vendor mở liên kết trên trình duyệt di động hoặc máy tính để điền giá cho từng dòng hàng, tải tệp catalog và xác nhận mà không cần tạo tài khoản.
   * Ma trận so sánh giá tự động quy đổi ngoại tệ theo tỷ giá cơ sở tại thời điểm lập dự án, giúp ban giám đốc có cái nhìn trực quan và chuẩn xác để ra quyết định lựa chọn nhà cung cấp.
4. **Phân hệ 4 — Quản Trị Công Việc Vi Mô và Hồ Sơ Dự Thầu (Bidding Operations & Tasks):**
   * **Cơ chế điều phối công việc vi mô thông minh (Dynamic Task Dispatcher Engine):** Tự động sinh danh mục công việc cần làm dựa trên thuộc tính gói thầu (gói thầu Nhà nước tự động sinh việc mua HSMT và nộp bảo lãnh ngân hàng; hàng nhập khẩu tự động sinh việc tra cứu HS Code và thẩm tra CO Form E).
   * **Tùy biến SLA động và công việc đột xuất (Ad-hoc Tasks):** Thời hạn hoàn thành tự động co ngắn theo độ gấp gáp của thời điểm đóng thầu; Quản lý dự án có toàn quyền thêm việc đột xuất, giao việc chéo phòng ban ngay trên bảng Kanban.
   * **Chốt chặn hoàn thành công việc (Task Completion Gate):** Ngăn chặn chuyển bước khi còn công việc trọng yếu chưa hoàn thành; hỗ trợ lắp ráp và xuất gói hồ sơ dự thầu ZIP/PDF có mục lục đánh số trang tự động.
5. **Phân hệ 5 — Theo Dõi Lô Hàng, Vận Chuyển và Báo Cáo Phân Tích (Logistics & BI Analytics):**
   * Theo dõi chi tiết thông tin vận đơn, các mốc giao nhận hàng hóa (sẵn sàng tại xưởng, bốc hàng lên tàu, cập cảng đích, thông quan hải quan, giao hàng tại kho người mua).
   * Tiến trình chạy ngầm định kỳ 8:00 AM hằng ngày tự động rà quét các mốc tiến độ để gửi cảnh báo đỏ cho các lô hàng có nguy cơ trễ hạn.
   * Bảng điều khiển phân tích cung cấp báo cáo tỷ lệ trúng thầu theo ngành hàng, nguyên nhân trượt thầu và báo cáo thời gian chu kỳ để xác định điểm nghẽn trong quy trình nội bộ.
