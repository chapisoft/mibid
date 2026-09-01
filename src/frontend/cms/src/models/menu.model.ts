export interface IAppMenu {
  id: string;
  parentId?: string | null;
  code: string;
  name: string;
  routePath: string;
  iconName: string;
  moduleCode: string;
  sortOrder: number;
  isActive: boolean;
  isSystem?: boolean;
  requiredPermission?: string;
  createdAt?: string;
  updatedAt?: string;
  children?: IAppMenu[];
}

export interface ITenantMenuPermission {
  id: string;
  tenantId: string;
  menuId: string;
  menuCode: string;
  menuName: string;
  routePath: string;
  moduleCode: string;
  isEnabled: boolean;
  customLabel?: string;
}

export interface ICreateMenuCommand {
  parentId?: string | null;
  code: string;
  name: string;
  routePath: string;
  iconName: string;
  moduleCode: string;
  sortOrder: number;
  isActive: boolean;
  requiredPermission?: string;
}

export interface IUpdateMenuCommand {
  parentId?: string | null;
  name: string;
  routePath: string;
  iconName: string;
  moduleCode: string;
  sortOrder: number;
  isActive: boolean;
  requiredPermission?: string;
}

export interface IAssignTenantMenusCommand {
  tenantId: string;
  menuIds: string[];
}
