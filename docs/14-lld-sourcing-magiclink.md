# THIẾT KẾ CHI TIẾT CẤP THẤP (LLD) — PHÂN HỆ 3
## MUA HÀNG, CỔNG MAGIC LINK VÀ MA TRẬN SO SÁNH GIÁ (COMPARISON MATRIX)
### MÃ TÀI LIỆU: MIBID_LLD_MOD03_v1.0

---

## 1. TỔNG QUAN PHÂN HỆ VÀ RANH GIỚI TRÁCH NHIỆM

Phân hệ 3 quản lý chu trình mua hàng, bóc tách yêu cầu báo giá RFQ, cấp phát liên kết truy cập một lần Magic Link cho các nhà cung cấp quốc tế không cần tài khoản, và Comparison Matrix Engine đa ngoại tệ phục vụ việc phê duyệt giá vốn.

---

## 2. CỔNG VÀO (INBOUND PORTS) VÀ ĐẶC TẢ DTO

```java
public interface RFQManagementUseCase {
    RFQResponse createRFQ(CreateRFQRequest request);
    void publishRFQ(UUID rfqId);
}

public interface MagicLinkPortalUseCase {
    PortalInitResponse verifyAndInitPortal(String token, String pinCode);
    QuotationResponse submitQuotation(String token, SubmitQuotationRequest request);
}

public interface ComparisonMatrixUseCase {
    ComparisonMatrixResponse getMatrixData(UUID rfqId, String targetCurrency);
    void approveQuotation(UUID quotationId, UUID approverId, String note);
}
```

---

## 3. CỔNG RA (OUTBOUND PORTS)

```java
public interface RFQRepositoryPort {
    Optional<RFQ> findById(UUID rfqId);
    RFQ save(RFQ rfq);
}

public interface MagicLinkRepositoryPort {
    Optional<MagicLink> findByToken(String token);
    MagicLink save(MagicLink magicLink);
}

public interface QuotationRepositoryPort {
    List<Quotation> findByRfqId(UUID rfqId);
    Optional<Quotation> findById(UUID quotationId);
    Quotation save(Quotation quotation);
}

public interface TokenBlacklistPort {
    boolean isTokenUsed(String token);
    void markTokenUsed(String token, Duration ttl);
}
```

---

## 4. ĐẶC TẢ RESTFUL API CONTRACTS & OPENAPI SCHEMAS

### 4.1. Endpoint Xác Thực Mã PIN Magic Link Của Đối Tác
* **Đường dẫn:** `POST /api/v1/portal/verify-pin`
* **Request Payload Schema:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "pin_code": "8824"
}
```
* **Response Payload Thành Công (200 OK):**
```json
{
  "rfq_code": "RFQ-2026-XNK01",
  "title": "Báo giá Vật tư Van Kỹ thuật & Mặt bích thép không gỉ",
  "incoterms": "FOB",
  "deadline": "2026-09-05T17:00:00Z",
  "vendor_email": "sales@shanghai-valve.com",
  "line_items": [
    {
      "item_id": "e1f2a3b4-c5d6-7e8f-9a0b-1c2d3e4f5a6b",
      "item_no": 1,
      "description": "Van bi Inox 316 DN50 Class 150",
      "part_number": "SS316-BV-DN50",
      "quantity": 100.0,
      "uom": "PCS"
    }
  ]
}
```

### 4.2. Endpoint Nhà Cung Cấp Nộp Báo Giá
* **Đường dẫn:** `POST /api/v1/portal/quotations`
* **Request Payload Schema:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "currency": "USD",
  "freight_cost": 450.0,
  "insurance_cost": 50.0,
  "eta_date": "2026-09-20",
  "origin_port": "Shanghai Port",
  "items": [
    {
      "line_item_id": "e1f2a3b4-c5d6-7e8f-9a0b-1c2d3e4f5a6b",
      "unit_price": 45.50,
      "lead_time_days": 14
    }
  ]
}
```

---

## 5. LOGIC NGHIỆP VỤ VÀ MÃ GIẢ (PSEUDOCODE)

```java
// Logic Nhà cung cấp nộp Báo giá qua Magic Link (Bảo đảm Idempotency chống nộp trùng)
@Transactional
public QuotationResponse submitQuotation(String token, SubmitQuotationRequest request) {
    MagicLink magicLink = magicLinkRepository.findByToken(token)
        .orElseThrow(() -> new InvalidTokenException("MAGIC_LINK_NOT_FOUND", "Liên kết không tồn tại"));

    if (magicLink.getExpiresAt().isBefore(Instant.now())) {
        throw new ExpiredTokenException("MAGIC_LINK_EXPIRED", "Liên kết báo giá đã hết hạn sử dụng");
    }

    if ("USED".equals(magicLink.getStatus()) || tokenBlacklistPort.isTokenUsed(token)) {
        throw new DuplicateSubmissionException("MAGIC_LINK_ALREADY_USED", "Liên kết báo giá này đã được sử dụng");
    }

    // Tính toán tổng giá trị đơn hàng
    BigDecimal subtotal = BigDecimal.ZERO;
    List<QuotationLineItem> items = new ArrayList<>();

    for (ItemQuoteDTO itemDTO : request.getItems()) {
        BigDecimal totalLine = itemDTO.getUnitPrice().multiply(itemDTO.getQuantity());
        subtotal = subtotal.add(totalLine);

        QuotationLineItem line = new QuotationLineItem();
        line.setRfqLineItemId(itemDTO.getLineItemId());
        line.setUnitPrice(itemDTO.getUnitPrice());
        line.setTotalPrice(totalLine);
        line.setLeadTimeDays(itemDTO.getLeadTimeDays());
        items.add(line);
    }

    BigDecimal grandTotal = subtotal.add(request.getFreightCost()).add(request.getInsuranceCost());

    Quotation quote = new Quotation();
    quote.setRfqId(magicLink.getRfqId());
    quote.setVendorEmail(magicLink.getVendorEmail());
    quote.setCurrency(request.getCurrency());
    quote.setSubtotal(subtotal);
    quote.setFreightCost(request.getFreightCost());
    quote.setGrandTotal(grandTotal);
    quote.setEtaDate(request.getEtaDate());
    quote.setStatus("SUBMITTED");

    Quotation savedQuote = quotationRepository.save(quote);
    items.forEach(it -> it.setQuotationId(savedQuote.getId()));
    quotationLineItemRepository.saveAll(items);

    // Vô hiệu hóa token tức thời chống tấn công gửi lặp lại
    magicLink.setStatus("USED");
    magicLinkRepository.save(magicLink);
    tokenBlacklistPort.markTokenUsed(token, Duration.ofDays(30));

    // Bắn sự kiện ra Outbox Table để gửi thông báo cho nhân viên mua hàng
    outboxEventPort.publish("QUOTATION_SUBMITTED", new QuoteSubmittedEvent(savedQuote.getId(), magicLink.getRfqId()));

    return quotationMapper.toResponse(savedQuote);
}
```

---

## 6. MA TRẬN MÃ LỖI NGHIỆP VỤ PHÂN HỆ 3

| Mã lỗi hệ thống | Mã HTTP | Mô tả nguyên nhân nghiệp vụ | Hướng xử lý phía Client |
| :--- | :---: | :--- | :--- |
| `MAGIC_LINK_EXPIRED` | 410 | Liên kết báo giá đã quá hạn nộp. | Báo đối tác liên hệ cán bộ mua hàng cấp link mới. |
| `MAGIC_LINK_ALREADY_USED` | 409 | Liên kết này đã nộp báo giá trước đó rồi. | Hiển thị thông báo báo giá đã được ghi nhận. |
| `INVALID_PIN_CODE` | 401 | Mã PIN bảo vệ 4 số nhập không chính xác. | Cho phép nhập lại (tối đa 5 lần sai). |
| `PIN_BRUTE_FORCE_LOCKED` | 429 | Nhập sai mã PIN quá 5 lần. | Khóa truy cập IP trong vòng 30 phút. |
| `CURRENCY_NOT_SUPPORTED` | 400 | Đồng tiền báo giá không nằm trong danh mục. | Yêu cầu chọn đúng USD, EUR, VND, CNY. |
