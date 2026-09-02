import { Department, TenderStage, UserRole } from './index';

export enum WorkflowNodeType {
  START = 'START',
  STAGE = 'STAGE',
  TASK = 'TASK',
  CONDITION = 'CONDITION',
  GATEKEEPER = 'GATEKEEPER',
  APPROVAL = 'APPROVAL',
  WEBHOOK = 'WEBHOOK',
  END = 'END',
}

export enum ApprovalMode {
  ANY = 'ANY',
  ALL_PARALLEL = 'ALL_PARALLEL',
  SEQUENTIAL = 'SEQUENTIAL',
}

export enum WorkflowStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ACTIVE = 'ACTIVE',
  ARCHIVED = 'ARCHIVED',
}

export enum WorkflowTemplateCategory {
  STANDARD = 'STANDARD',
  FAST_TRACK = 'FAST_TRACK',
  EPC_INTERNATIONAL = 'EPC_INTERNATIONAL',
  STANDARD_TENDER = 'STANDARD_TENDER',
  INTERNATIONAL_EPC = 'INTERNATIONAL_EPC',
  REGULAR_PROCUREMENT = 'REGULAR_PROCUREMENT',
}

export enum WorkflowValidationSeverity {
  ERROR = 'ERROR',
  WARNING = 'WARNING',
}

export enum ConditionOperator {
  GREATER_THAN = '>',
  GREATER_THAN_OR_EQUAL = '>=',
  LESS_THAN = '<',
  LESS_THAN_OR_EQUAL = '<=',
  EQUAL = '==',
  NOT_EQUAL = '!=',
}

export enum ConditionField {
  BUDGET_AMOUNT = 'budgetAmount',
  LANDED_COST_VND = 'landedCostVnd',
  WIN_RATE = 'winRate',
  SUPPLIER_COUNT = 'supplierCount',
  DAYS_REMAINING = 'daysRemaining',
}

export enum HandlePosition {
  TOP = 'top',
  RIGHT = 'right',
  BOTTOM = 'bottom',
  LEFT = 'left',
}

export interface NodeGatekeeperConfig {
  layer1DocChecklist: {
    enabled: boolean;
    requiredDocTypes: string[];
    enforceDmsValidityCheck: boolean;
  };
  layer2Financial: {
    enabled: boolean;
    maxBudgetThresholdVnd?: number;
    minBidBondPercentage?: number;
    requireCurrencyConversionCheck: boolean;
  };
  layer3Approval: {
    enabled: boolean;
    requiredRoles: UserRole[];
    approvalMode: ApprovalMode | 'ANY' | 'ALL_PARALLEL' | 'SEQUENTIAL';
    allowManagerBypass: boolean;
  };
  layer4DistributedLock: {
    enabled: boolean;
    lockKeyPrefix: string;
    leaseTimeSeconds: number;
    triggerNotificationOnSuccess: boolean;
    webhookUrl?: string;
  };
}

export interface NodeConditionBranch {
  id: string;
  label: string;
  field: ConditionField | 'budgetAmount' | 'landedCostVnd' | 'winRate' | 'supplierCount' | 'daysRemaining';
  operator: ConditionOperator | '>' | '>=' | '<' | '<=' | '==' | '!=';
  value: number | string;
  targetNodeId?: string;
}

export interface WorkflowNodeData {
  title: string;
  subtitle?: string;
  code: string;
  stageKey?: TenderStage;
  department: Department;
  slaDays: number;
  description?: string;
  gatekeeper: NodeGatekeeperConfig;
  conditionBranches?: NodeConditionBranch[];
  assignedRoles?: UserRole[];
}

export interface WorkflowNode {
  id: string;
  type: WorkflowNodeType | 'START' | 'STAGE' | 'TASK' | 'CONDITION' | 'GATEKEEPER' | 'APPROVAL' | 'WEBHOOK' | 'END';
  x: number;
  y: number;
  data: WorkflowNodeData;
  selected?: boolean;
}

export interface WorkflowEdge {
  id: string;
  sourceNodeId: string;
  targetNodeId: string;
  sourceHandle?: HandlePosition | 'top' | 'right' | 'bottom' | 'left';
  targetHandle?: HandlePosition | 'top' | 'right' | 'bottom' | 'left';
  label?: string;
  conditionExpression?: string;
  color?: string;
}

export interface WorkflowDefinition {
  id: string;
  code: string;
  name: string;
  version: string;
  status: WorkflowStatus | 'DRAFT' | 'PUBLISHED' | 'ACTIVE';
  tenantId: string;
  tenantName: string;
  description: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  updatedAt: string;
  createdAt: string;
}

export interface WorkflowTemplate {
  id: string;
  code: string;
  name: string;
  category: WorkflowTemplateCategory | string;
  description: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
}

export interface WorkflowValidationError {
  nodeId?: string;
  edgeId?: string;
  type: WorkflowValidationSeverity | 'ERROR' | 'WARNING';
  message: string;
}

export interface WorkflowValidationResult {
  isValid: boolean;
  errors: WorkflowValidationError[];
  warnings: WorkflowValidationError[];
}
