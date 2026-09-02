/**
 * Định nghĩa toàn bộ Enums và Interfaces chuẩn mực cho hệ thống MIBID Web CMS
 * TUÂN THỦ NGUYÊN TẮC ZERO-HARDCODE: Không sử dụng chuỗi hoặc số ma thuật
 */

export enum ErrorCode {
  SUCCESS = 'SUCCESS',
  BAD_REQUEST = 'BAD_REQUEST',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  RESOURCE_NOT_FOUND = 'RESOURCE_NOT_FOUND',
  CONFLICT = 'CONFLICT',
  MAGIC_LINK_EXPIRED = 'MAGIC_LINK_EXPIRED',
  MAGIC_LINK_INVALID_PIN = 'MAGIC_LINK_INVALID_PIN',
  MAGIC_LINK_LOCKED = 'MAGIC_LINK_LOCKED',
  CAPTCHA_REQUIRED = 'CAPTCHA_REQUIRED',
  PIN_REQUIRED = 'PIN_REQUIRED',
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
}

export enum PortalAuthStatus {
  AUTHENTICATED = 'AUTHENTICATED',
  UNAUTHORIZED = 'UNAUTHORIZED',
  LOCKED = 'LOCKED',
  CAPTCHA_REQUIRED = 'CAPTCHA_REQUIRED',
  SUBMITTED = 'SUBMITTED',
}

export enum RfqVendorStatus {
  INVITED = 'INVITED',
  LINK_SENT = 'LINK_SENT',
  VIEWED = 'VIEWED',
  AUTHENTICATED = 'AUTHENTICATED',
  SUBMITTED = 'SUBMITTED',
  DECLINED = 'DECLINED',
  DISQUALIFIED = 'DISQUALIFIED',
}

export enum UserRole {
  ADMIN = 'ADMIN',
  TENANT_ADMIN = 'TENANT_ADMIN',
  BID_MANAGER = 'BID_MANAGER',
  SOURCING_SPECIALIST = 'SOURCING_SPECIALIST',
  TECHNICAL_LEAD = 'TECHNICAL_LEAD',
  FINANCE_LEAD = 'FINANCE_LEAD',
  LEGAL_OFFICER = 'LEGAL_OFFICER',
  LOGISTICS_COORDINATOR = 'LOGISTICS_COORDINATOR',
  VIEWER = 'VIEWER',
}

export type CmsScreen =
  | 'home'
  | 'login'
  | 'dashboard'
  | 'projects'
  | 'kanban'
  | 'workflow'
  | 'workflows'
  | 'sourcing'
  | 'partners'
  | 'matrix'
  | 'tasks'
  | 'logistics'
  | 'dms'
  | 'analytics'
  | 'tenants'
  | 'users'
  | 'roles'
  | 'menus'
  | 'subscriptions'
  | 'integration';

export enum SubscriptionPlanCode {
  STARTER = 'STARTER',
  PROFESSIONAL = 'PROFESSIONAL',
  ENTERPRISE = 'ENTERPRISE',
}

export interface SubscriptionPlan {
  id: string;
  code: string;
  name: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  maxUsers: number;
  maxMachines?: number;
  maxStorageGb: number;
  allowedModules?: string;
  isActive: boolean;
}

export enum PaymentTerm {
  LC_AT_SIGHT = 'LC_AT_SIGHT',
  TT_30_70 = 'TT_30_70',
  TT_100_ADVANCE = 'TT_100_ADVANCE',
  TT_NET_30 = 'TT_NET_30',
  DP = 'DP',
}

export enum PartnerStatus {
  ACTIVE = 'ACTIVE',
  PENDING = 'PENDING',
  SUSPENDED = 'SUSPENDED',
}

export enum PartnerOnboardingStatus {
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  NEED_CLARIFICATION = 'NEED_CLARIFICATION',
}

export enum PartnerTicketIssueType {
  FORGOT_PIN = 'FORGOT_PIN',
  EXPIRED_LINK = 'EXPIRED_LINK',
  ATTACHMENT_ERROR = 'ATTACHMENT_ERROR',
  TECHNICAL_QUESTION = 'TECHNICAL_QUESTION',
}

export enum PartnerTicketStatus {
  OPEN = 'OPEN',
  RESOLVED = 'RESOLVED',
  IN_PROGRESS = 'IN_PROGRESS',
}

export interface SupplierPartner {
  id: string;
  code: string;
  name: string;
  taxCode: string;
  country: string;
  category: string;
  rating: number;
  contactPerson: string;
  email: string;
  phone: string;
  status: PartnerStatus;
  totalQuotesSubmitted: number;
  totalWonBids: number;
  isoCertified?: boolean;
  createdAt: string;
}

export interface PartnerOnboardingRequest {
  id: string;
  companyName: string;
  taxCode: string;
  country: string;
  category: string;
  contactPerson: string;
  email: string;
  phone: string;
  certFileName: string;
  status: PartnerOnboardingStatus;
  submittedAt: string;
  reviewNotes?: string;
}

export interface PartnerSupportTicket {
  id: string;
  ticketCode: string;
  partnerName: string;
  partnerEmail: string;
  rfqCode: string;
  issueType: PartnerTicketIssueType;
  status: PartnerTicketStatus;
  requestedAt: string;
  currentPin?: string;
}

export enum TenderStage {
  STAGE_PREPARATION = 'STAGE_PREPARATION',           // Bước 1: Nghiên cứu HSMT & Lập nhóm
  STAGE_SOURCING = 'STAGE_SOURCING',                 // Bước 2: Sourcing RFQ & Giá
  STAGE_DOSSIER_PREP = 'STAGE_DOSSIER_PREP',         // Bước 3: Lập Hồ sơ Dự thầu
  STAGE_INTERNAL_REVIEW = 'STAGE_INTERNAL_REVIEW',   // Bước 4: Thẩm định & Phê duyệt
  STAGE_SUBMISSION = 'STAGE_SUBMISSION',             // Bước 5: Nộp Thầu & Bảo Lãnh
  STAGE_AWARD_LOGISTICS = 'STAGE_AWARD_LOGISTICS',   // Bước 6: Mở Thầu & Vận Đơn
}

export enum TenderStatus {
  DRAFT = 'DRAFT',
  IN_PROGRESS = 'IN_PROGRESS',
  SUBMITTED = 'SUBMITTED',
  WON = 'WON',
  LOST = 'LOST',
  CANCELLED = 'CANCELLED',
}

export enum RfqStatus {
  DRAFT = 'DRAFT',
  SENT = 'SENT',
  QUOTED = 'QUOTED',
  EXPIRED = 'EXPIRED',
  CANCELLED = 'CANCELLED',
}

export enum Currency {
  USD = 'USD',
  EUR = 'EUR',
  JPY = 'JPY',
  CNY = 'CNY',
  GBP = 'GBP',
  KRW = 'KRW',
  SGD = 'SGD',
  VND = 'VND',
}

export enum BankExchangeProvider {
  VCB = 'VCB', // Ngân hàng TMCP Ngoại thương Việt Nam (Vietcombank)
  BIDV = 'BIDV', // Ngân hàng TMCP Đầu tư & Phát triển Việt Nam (BIDV)
  CTG = 'CTG', // Ngân hàng TMCP Công Thương Việt Nam (VietinBank)
  TCB = 'TCB', // Ngân hàng TMCP Kỹ Thương Việt Nam (Techcombank)
  SBV = 'SBV', // Ngân hàng Nhà nước Việt Nam (State Bank of Vietnam - Tỷ giá trung tâm)
  CUSTOMS = 'CUSTOMS', // Tổng Cục Hải Quan Việt Nam (Tỷ giá tính thuế XNK)
}

export enum RateCalculationType {
  SELL_TRANSFER = 'SELL_TRANSFER', // Tỷ giá bán chuyển khoản (Thanh toán L/C)
  BUY_TRANSFER = 'BUY_TRANSFER', // Tỷ giá mua chuyển khoản
  BUY_CASH = 'BUY_CASH', // Tỷ giá mua tiền mặt
  CUSTOMS_DUTY = 'CUSTOMS_DUTY', // Tỷ giá tính thuế xuất nhập khẩu
}

export enum BankRateSyncStatus {
  SYNCED = 'SYNCED',
  SYNCING = 'SYNCING',
  ERROR = 'ERROR',
}

export interface CurrencyRateEntry {
  currency: Currency;
  currencyName: string;
  buyCash: number;
  buyTransfer: number;
  sellTransfer: number;
  customsRate: number;
  change24h: number;
}

export interface BankRateSnapshot {
  provider: BankExchangeProvider;
  providerName: string;
  providerShortName: string;
  officialApiEndpoint: string;
  effectiveDate: string;
  rates: Record<Currency, CurrencyRateEntry>;
  lastSyncedAt: string;
  syncStatus: BankRateSyncStatus;
}

export interface ExchangeRateConfig {
  activeProvider: BankExchangeProvider;
  activeRateType: RateCalculationType;
  autoSyncEnabled: boolean;
  syncIntervalMinutes: number;
  fxRiskMarginPercent: number; // Biên độ dự phòng rủi ro trượt giá ngoại tệ (+0%, +0.5%, +1.0%)
  manualOverrides: Partial<Record<Currency, number>>;
  lastUpdated: string;
}

export enum Incoterm {
  EXW = 'EXW',
  FOB = 'FOB',
  CIF = 'CIF',
  CIP = 'CIP',
  DDP = 'DDP',
}

export enum Department {
  TECHNICAL = 'TECHNICAL',
  COMMERCIAL = 'COMMERCIAL',
  FINANCE = 'FINANCE',
  LEGAL = 'LEGAL',
}

export enum TaskPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  REVIEWING = 'REVIEWING',
  COMPLETED = 'COMPLETED',
}

export enum DocumentType {
  LEGAL_PROFILE = 'LEGAL_PROFILE',
  FINANCIAL_CAPACITY = 'FINANCIAL_CAPACITY',
  ISO_CERTIFICATION = 'ISO_CERTIFICATION',
  SIMILAR_CONTRACT = 'SIMILAR_CONTRACT',
  AUTHORIZATION_LETTER = 'AUTHORIZATION_LETTER',
  TECHNICAL_CATALOG = 'TECHNICAL_CATALOG',
}

export enum DocumentStatus {
  VALID = 'VALID',
  EXPIRING_SOON = 'EXPIRING_SOON',
  EXPIRED = 'EXPIRED',
}

export enum LogisticsStatus {
  BOOKED = 'BOOKED',
  SAILING = 'SAILING',
  CUSTOMS_CLEARING = 'CUSTOMS_CLEARING',
  PORT_ARRIVED = 'PORT_ARRIVED',
  DELIVERED = 'DELIVERED',
}

export enum GatekeeperCheckType {
  DOC_CHECKLIST = 'DOC_CHECKLIST',
  FINANCIAL_SECURITY = 'FINANCIAL_SECURITY',
  LEAD_APPROVAL = 'LEAD_APPROVAL',
  DISTRIBUTED_LOCK = 'DISTRIBUTED_LOCK',
}

export enum GatekeeperStatus {
  PASSED = 'PASSED',
  WARNING = 'WARNING',
  BLOCKED = 'BLOCKED',
  PENDING = 'PENDING',
}

export interface TenantInfo {
  id: string;
  code: string;
  name: string;
  role?: string;
  isDefault?: boolean;
}

export interface UserSession {
  id: string;
  username: string;
  fullName: string;
  email: string;
  role: UserRole;
  tenantId: string;
  tenantName: string;
  avatarUrl?: string;
  currentTenant?: TenantInfo;
  authorizedTenants?: TenantInfo[];
  token?: string;
}

export enum TenderType {
  TENANT_PARTICIPATING = 'TENANT_PARTICIPATING', // Gói thầu Tenant tham gia (Tổng thầu / Đi dự thầu CĐT)
  TENANT_ISSUED = 'TENANT_ISSUED',               // Gói thầu do Tenant mở (Mời thầu / Mua sắm Sourcing)
}

export interface TenderProject {
  id: string;
  projectCode: string;
  projectName: string;
  investorName: string;
  tenderType?: TenderType; // Phân loại: Do Tenant mở hay Tenant tham gia
  budgetAmount: number;
  budgetCurrency: Currency;
  submissionDeadline: string;
  currentStage: TenderStage;
  status: TenderStatus;
  bidManagerName: string;
  completionRate: number;
  workflowId?: string;
  workflowName?: string;
}

export interface RfqLineItem {
  id: string;
  itemCode: string;
  itemName: string;
  specs: string;
  unit: string;
  quantity: number;
  origin?: string;
  unitPrice?: number;
  totalAmount?: number;
}

export enum UploadedDocType {
  CO_CQ = 'CO_CQ',
  DATASHEET = 'DATASHEET',
  CATALOG = 'CATALOG',
  OTHER = 'OTHER',
}

export interface UploadedDoc {
  id: string;
  name: string;
  size: string;
  type: UploadedDocType;
  uploadedAt: string;
}

export interface RfqQuotationDetail {
  rfqId: string;
  rfqCode: string;
  projectId: string;
  projectName: string;
  supplierName: string;
  supplierEmail: string;
  supplierContact?: string;
  supplierCountry?: string;
  currency: Currency;
  incoterm: Incoterm;
  paymentTerm: string;
  loadingPort: string;
  dischargePort: string;
  leadTimeWeeks: number;
  warrantyMonths: number;
  notes: string;
  submittedAt: string;
  items: RfqLineItem[];
  attachedDocs: UploadedDoc[];
  totalAmount: number;
  digitalChecksum: string;
  securityPin: string;
  status: RfqStatus;
}

export interface RfqPackage {
  id: string;
  rfqCode: string;
  title?: string;
  projectId: string;
  projectName: string;
  supplierName: string;
  supplierEmail: string;
  itemCount: number;
  currency: Currency;
  incoterm: Incoterm;
  totalQuoteAmount?: number;
  status: RfqStatus;
  magicLinkExpiresAt?: string;
  createdAt?: string;
  invitationCode?: string;
}

export interface TaskEvidenceDoc {
  id: string;
  name: string;
  docCode: string;
  isUploaded: boolean;
  fileUrl?: string;
  uploadedAt?: string;
  uploadedBy?: string;
}

export interface TaskGateChecklist {
  id: string;
  title: string;
  isPassed: boolean;
  passedAt?: string;
  passedBy?: string;
}

export interface TaskItem {
  id: string;
  projectId: string;
  projectCode: string;
  taskTitle: string;
  department: Department;
  assigneeName: string;
  priority: TaskPriority;
  status: TaskStatus;
  startDate: string;
  deadline: string;
  completedAt?: string;
  durationDays?: number;
  checklistTotal: number;
  checklistDone: number;
  evidenceDocs?: TaskEvidenceDoc[];
  gateChecklists?: TaskGateChecklist[];
  gatePassed?: boolean;
}

export interface DynamicStageChecklist {
  id: string;
  projectId?: string;
  stage: string;
  title: string;
  description: string;
  isRequired: boolean;
  docCode: string;
  assigneeRole: string;
  sortOrder?: number;
  isChecked?: boolean;
}

export enum DocumentOwnerType {
  TENANT = 'TENANT', // Hồ sơ của Doanh Nghiệp Tenant đang đăng nhập
  VENDOR = 'VENDOR', // Hồ sơ của Nhà Cung Cấp / Đối Tác
}

export interface DocumentItem {
  id: string;
  documentName: string;
  documentType: DocumentType;
  ownerType: DocumentOwnerType; // TENANT hoặc VENDOR
  ownerId: string; // ID của Tenant hoặc Vendor
  ownerName: string; // Tên Doanh Nghiệp Tenant hoặc Tên Vendor
  vendorCode?: string; // Mã vendor nếu là hồ sơ vendor
  docCode?: string; // Số hiệu chứng từ / văn bản
  fileSize: string;
  issuerName: string;
  effectiveFrom: string;
  effectiveTo: string;
  status: DocumentStatus;
  daysRemaining: number;
  notes?: string;
  isVerified?: boolean;
}

export enum TransportMode {
  SEA = 'SEA',
  AIR = 'AIR',
  ROAD = 'ROAD',
  RAIL = 'RAIL',
}

export enum DeliveryScheduleStatus {
  ON_TIME = 'ON_TIME',
  EARLY = 'EARLY',
  DELAYED_MINOR = 'DELAYED_MINOR',
  DELAYED_CRITICAL = 'DELAYED_CRITICAL',
}

export enum ShipmentMilestoneStatus {
  COMPLETED = 'COMPLETED',
  IN_PROGRESS = 'IN_PROGRESS',
  PENDING = 'PENDING',
  DELAYED = 'DELAYED',
}

export enum ShipmentDocType {
  ORIGINAL_BL = 'ORIGINAL_BL',
  COMMERCIAL_INVOICE = 'COMMERCIAL_INVOICE',
  PACKING_LIST = 'PACKING_LIST',
  CO_CERTIFICATE = 'CO_CERTIFICATE',
  CQ_CERTIFICATE = 'CQ_CERTIFICATE',
  CUSTOMS_DECLARATION = 'CUSTOMS_DECLARATION',
  INSURANCE_POLICY = 'INSURANCE_POLICY',
}

export interface ShipmentCargoItem {
  id: string;
  itemCode: string;
  itemName: string;
  specification: string;
  quantity: number;
  unit: string;
  containerNo?: string;
  sealNo?: string;
  grossWeightKg?: number;
}

export interface ShipmentMilestone {
  id: string;
  stepName: string;
  plannedDate: string;
  actualDate?: string;
  status: ShipmentMilestoneStatus;
  location: string;
  notes?: string;
}

export interface ShipmentDoc {
  id: string;
  docType: ShipmentDocType;
  docName: string;
  fileSize: string;
  docNumber: string;
  isVerified: boolean;
  uploadedAt: string;
}

export interface ShipmentItem {
  id: string;
  trackingNumber: string;
  blNumber: string;
  // Liên kết Gói thầu / Gói mua sắm
  projectId: string;
  projectCode: string;
  projectName: string;
  investorName: string;
  tenderType: TenderType;
  // Thông tin Hợp đồng & Nhà cung cấp
  contractNumber: string;          // Số hợp đồng ngoại thương / PO (ví dụ: HD-2026/EVN-TBEA-01)
  supplierName: string;            // Tên nhà cung cấp xuất khẩu (TBEA Co., Ltd, Siemens Energy...)
  originCountry: string;           // Quốc gia xuất xứ (Đức, Trung Quốc, Nhật Bản, Mỹ...)
  // Vận tải & Cảng
  carrierName: string;             // Hãng tàu / Đơn vị vận chuyển (Maersk, COSCO, ONE, Evergreen...)
  vesselName?: string;             // Tên tàu / Số chuyến (MAERSK HANOI V.2608E)
  originPort: string;              // Cảng bốc hàng (POL)
  destinationPort: string;         // Cảng dỡ hàng (POD)
  transportMode: TransportMode;
  containerDetails?: string;       // Quy cách (ví dụ: 2x40'HC + 1x20'GP, 45 Tấn)
  // Kế hoạch Giao Hàng & Đối Chiếu Tiến Độ
  contractDeliveryDeadline: string;// Hạn giao hàng cam kết theo Hợp đồng
  etdDate: string;                 // Ngày khởi hành (ETD)
  etaDate: string;                 // Ngày đến đích (ETA)
  actualDeliveryDate?: string;     // Ngày giao hàng thực tế tại công trường
  scheduleStatus: DeliveryScheduleStatus;
  delayDays: number;               // Số ngày chênh lệch (+ sớm, - trễ)
  status: LogisticsStatus;         // Trạng thái vận đơn
  isDelayed: boolean;
  // Chi tiết hàng hóa, mốc hành trình và chứng từ
  cargoSummary: string;            // Tóm tắt danh mục thiết bị
  cargoItems?: ShipmentCargoItem[];// Danh mục thiết bị BoQ chi tiết
  milestones?: ShipmentMilestone[];// 5 mốc tiến độ đối chiếu kế hoạch
  documents?: ShipmentDoc[];       // Danh mục chứng từ hải quan
}

export enum TenantAccountStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
}

export interface TenantAccount {
  id: string;
  tenantCode: string;
  tenantName: string;
  taxCode: string;
  subscriptionPlan: string;
  userCount: number;
  activeProjects: number;
  status: TenantAccountStatus;
}

export enum UserAccountStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  LOCKED = 'LOCKED',
}

export interface UserAccount {
  id: string;
  username: string;
  fullName: string;
  email: string;
  phone: string;
  role: UserRole;
  department: Department;
  tenantId: string;
  status: UserAccountStatus;
}

export * from './workflow';
