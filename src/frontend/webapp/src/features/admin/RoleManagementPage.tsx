'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Shield, Plus, Check, Edit2, Save, X, Trash2, AlertTriangle, Lock, RefreshCw } from 'lucide-react';
import { useToast } from '../../shared/toast/ToastContext';
import { roleService, IRoleDto } from '../../services/roleService';
import { menuService, IAppMenu } from '../../services/menuService';

interface IPermissionItem {
  code: string;
  name: string;
}

interface IPermissionGroup {
  module: string;
  items: IPermissionItem[];
}

export function RoleManagementPage() {
  const { showToast } = useToast();
  const [roles, setRoles] = useState<IRoleDto[]>([]);
  const [menus, setMenus] = useState<IAppMenu[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingMatrix, setSavingMatrix] = useState(false);
  const [selectedRole, setSelectedRole] = useState<IRoleDto | null>(null);
  const [isEditingMatrix, setIsEditingMatrix] = useState(false);

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<IRoleDto | null>(null);
  const [deletingRole, setDeletingRole] = useState<IRoleDto | null>(null);

  // Form states for Create
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleDesc, setNewRoleDesc] = useState('');

  // Nạp dữ liệu thực tế từ Backend REST APIs
  const loadData = async () => {
    try {
      setLoading(true);
      const [fetchedRoles, fetchedMenus] = await Promise.all([
        roleService.getAllRoles(),
        menuService.getAllMenus(),
      ]);

      setRoles(fetchedRoles);
      setMenus(fetchedMenus);

      if (fetchedRoles.length > 0) {
        setSelectedRole(fetchedRoles[0]);
      } else {
        setSelectedRole(null);
      }
    } catch (err) {
      console.error('Lỗi khi nạp danh sách vai trò hoặc menu:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Xây dựng ma trận quyền ĐỘNG 100% từ danh sách AppMenu thực tế trong CSDL
  const permissionMatrix: IPermissionGroup[] = useMemo(() => {
    const groupMap: Record<string, IPermissionGroup> = {};
    const moduleLabels: Record<string, string> = {
      CORE: 'Phân Hệ Báo Cáo & Tổng Quan (CORE)',
      BIDDING: 'Quản Lý Đấu Thầu & Dự Án (BIDDING)',
      SOURCING: 'Thu Mua & Sourcing NCC (SOURCING)',
      LOGISTICS: 'Logistics & Vận Đơn (LOGISTICS)',
      DMS: 'Kho Tài Liệu & Hồ Sơ Số (DMS)',
      ANALYTICS: 'Báo Cáo & Phân Tích Thống Kê (ANALYTICS)',
      SYSTEM_ADMIN: 'Quản Trị Hệ Thống & Phân Quyền (ADMIN)',
      SAAS_BILLING: 'Thuê Bao & Gói Cước (SAAS)',
    };

    menus.forEach((m) => {
      const mod = m.moduleCode || 'CORE';
      if (!groupMap[mod]) {
        groupMap[mod] = {
          module: moduleLabels[mod] || `Phân Hệ ${mod}`,
          items: [],
        };
      }

      if (m.requiredPermission) {
        // Tránh trùng lặp mã quyền
        const alreadyExists = groupMap[mod].items.some((item) => item.code === m.requiredPermission);
        if (!alreadyExists) {
          groupMap[mod].items.push({
            code: m.requiredPermission,
            name: `Quyền truy cập màn hình: ${m.name || m.title}`,
          });
        }
      }
    });

    return Object.values(groupMap);
  }, [menus]);

  // Bật/tắt quyền trong ma trận
  const handleTogglePerm = (permCode: string) => {
    if (!isEditingMatrix || !selectedRole || selectedRole.isSystem) return;

    const exists = selectedRole.permissions.includes(permCode);
    const updatedPermissions = exists
      ? selectedRole.permissions.filter((p) => p !== permCode)
      : [...selectedRole.permissions, permCode];

    const updatedRole: IRoleDto = { ...selectedRole, permissions: updatedPermissions };
    setSelectedRole(updatedRole);
    setRoles((prev) => prev.map((r) => (r.id === updatedRole.id ? updatedRole : r)));
  };

  // Lưu ma trận phân quyền trực tiếp vào PostgreSQL Backend
  const handleSaveMatrix = async () => {
    if (!selectedRole) return;
    try {
      setSavingMatrix(true);
      const savedPerms = await roleService.updateRolePermissions(
        selectedRole.id,
        selectedRole.permissions
      );
      const updatedRole: IRoleDto = { ...selectedRole, permissions: savedPerms };
      setSelectedRole(updatedRole);
      setRoles((prev) => prev.map((r) => (r.id === updatedRole.id ? updatedRole : r)));
      setIsEditingMatrix(false);
      showToast('Đã lưu ma trận phân quyền thành công!', 'success');
    } catch (err) {
      console.error('Lỗi khi lưu ma trận phân quyền:', err);
      showToast('Không thể lưu ma trận phân quyền vào hệ thống.', 'error');
    } finally {
      setSavingMatrix(false);
    }
  };

  // Tạo vai trò mới
  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleName.trim()) return;

    try {
      const created = await roleService.createRole({
        name: newRoleName.trim(),
        description: newRoleDesc.trim(),
        permissions: ['DASHBOARD:VIEW'],
      });

      setRoles((prev) => [...prev, created]);
      setSelectedRole(created);
      setIsCreateModalOpen(false);
      setNewRoleName('');
      setNewRoleDesc('');
      showToast('Đã tạo vai trò mới thành công!', 'success');
    } catch (err) {
      console.error('Lỗi khi tạo vai trò mới:', err);
      showToast('Không thể tạo vai trò mới. Vui lòng thử lại.', 'error');
    }
  };

  // Xóa vai trò tùy biến
  const handleDeleteRole = async () => {
    if (!deletingRole || deletingRole.isSystem) return;

    try {
      await roleService.deleteRole(deletingRole.id);
      const nextRoles = roles.filter((r) => r.id !== deletingRole.id);
      setRoles(nextRoles);
      if (selectedRole?.id === deletingRole.id) {
        setSelectedRole(nextRoles[0] || null);
      }
      setDeletingRole(null);
      showToast('Đã xóa vai trò thành công!', 'success');
    } catch (err) {
      console.error('Lỗi khi xóa vai trò:', err);
      showToast('Không thể xóa vai trò này.', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12 text-slate-400 text-sm gap-2">
        <RefreshCw className="w-5 h-5 animate-spin text-blue-600" />
        <span>Đang nạp dữ liệu vai trò và danh mục phân quyền...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Nhóm Quyền & Ma Trận Phân Quyền (RBAC Matrix)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Quản trị vai trò người dùng và phân quyền động liên kết 100% với danh mục Menu hệ thống MIBID
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsCreateModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-500/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm Vai Trò Mới</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Danh sách vai trò thực tế từ CSDL */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Danh Sách Vai Trò ({roles.length})
            </h2>
            <button
              type="button"
              onClick={loadData}
              className="p-1 rounded text-slate-400 hover:text-blue-600 transition-colors"
              title="Làm mới dữ liệu"
            >
              <RefreshCw size={13} />
            </button>
          </div>

          <div className="space-y-2">
            {roles.map((role) => {
              const isSelected = selectedRole?.id === role.id;
              return (
                <div
                  key={role.id}
                  onClick={() => {
                    setSelectedRole(role);
                    setIsEditingMatrix(false);
                  }}
                  className={`p-3.5 rounded-xl cursor-pointer transition-all border ${
                    isSelected
                      ? 'bg-blue-50/70 dark:bg-blue-950/40 border-blue-300 dark:border-blue-700 shadow-xs'
                      : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-900 dark:text-white text-xs sm:text-sm">
                      {role.name}
                    </span>
                    {role.isSystem ? (
                      <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 flex items-center gap-1">
                        <Lock size={10} /> Hệ Thống
                      </span>
                    ) : (
                      <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => setDeletingRole(role)}
                          className="p-1 text-slate-400 hover:text-red-600 rounded hover:bg-red-50"
                          title="Xóa vai trò"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                    {role.description || 'Chưa có mô tả nhiệm vụ'}
                  </p>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-200/60 dark:border-slate-800 text-xs">
                    <span className="font-mono text-blue-600 dark:text-blue-400 text-[11px] font-bold">
                      {role.permissions?.length || 0} quyền được cấp
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Ma trận chi tiết kết nối động với app_menus */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-6">
          {selectedRole ? (
            <>
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Shield size={20} className="text-blue-600" />
                    Ma Trận Quyền Của [{selectedRole.name}]
                  </h2>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">
                    Định danh vai trò: {selectedRole.id}
                  </p>
                </div>

                {!selectedRole.isSystem && (
                  <div>
                    {isEditingMatrix ? (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          disabled={savingMatrix}
                          onClick={() => setIsEditingMatrix(false)}
                          className="px-3.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl"
                        >
                          Hủy
                        </button>
                        <button
                          type="button"
                          disabled={savingMatrix}
                          onClick={handleSaveMatrix}
                          className="flex items-center gap-1.5 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm shadow-blue-500/20 disabled:opacity-50"
                        >
                          <Save size={14} />
                          <span>{savingMatrix ? 'Đang Lưu...' : 'Lưu Thay Đổi'}</span>
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setIsEditingMatrix(true)}
                        className="flex items-center gap-1.5 px-4 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl"
                      >
                        <Edit2 size={14} />
                        <span>Chỉnh Sửa Quyền</span>
                      </button>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-6">
                {permissionMatrix.map((group, gIdx) => (
                  <div key={gIdx} className="space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                      {group.module}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {group.items.map((item) => {
                        const hasPerm =
                          selectedRole.permissions?.includes('ALL') ||
                          selectedRole.permissions?.includes(item.code);
                        return (
                          <div
                            key={item.code}
                            onClick={() => handleTogglePerm(item.code)}
                            className={`flex items-start gap-3 p-3 rounded-xl border transition-colors ${
                              isEditingMatrix && !selectedRole.isSystem
                                ? 'cursor-pointer hover:border-blue-400'
                                : ''
                            } ${
                              hasPerm
                                ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800'
                                : 'bg-slate-50/50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 opacity-60'
                            }`}
                          >
                            <div
                              className={`mt-0.5 w-4 h-4 rounded flex items-center justify-center ${
                                hasPerm
                                  ? 'bg-emerald-600 text-white'
                                  : 'border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800'
                              }`}
                            >
                              {hasPerm && <Check size={12} strokeWidth={3} />}
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-slate-900 dark:text-white">
                                {item.name}
                              </p>
                              <span className="font-mono text-[11px] text-slate-400">{item.code}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-slate-400 text-sm">
              Chưa có vai trò nào được chọn.
            </div>
          )}
        </div>
      </div>

      {/* Modal: Tạo Vai Trò Mới */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Thêm Vai Trò Mới</h3>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRole} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Tên Vai Trò
                </label>
                <input
                  type="text"
                  required
                  placeholder="VD: Chuyên Viên Thẩm Định Giá"
                  value={newRoleName}
                  onChange={(e) => setNewRoleName(e.target.value)}
                  className="w-full h-10 px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Mô Tả Nhiệm Vụ
                </label>
                <textarea
                  rows={3}
                  placeholder="VD: Kiểm tra tính tuân thủ pháp lý và ngân sách đấu thầu..."
                  value={newRoleDesc}
                  onChange={(e) => setNewRoleDesc(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20"
                >
                  Lưu Vai Trò
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Xác Nhận Xóa Vai Trò */}
      {deletingRole && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <div className="p-2.5 rounded-2xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Xác Nhận Xóa Vai Trò
                </h3>
                <p className="text-xs text-slate-500">Hành động này không thể hoàn tác</p>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
              Bạn có chắc chắn muốn xóa vai trò tùy biến{' '}
              <strong className="text-slate-900 dark:text-white">{deletingRole.name}</strong>?
            </p>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setDeletingRole(null)}
                className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleDeleteRole}
                className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-500/20"
              >
                Xóa Vai Trò
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
