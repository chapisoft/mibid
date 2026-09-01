'use client';

import React, { useState } from 'react';
import { Shield, Plus, Check, Edit2, Save, X, Trash2, AlertTriangle, Lock } from 'lucide-react';

interface IRole {
  id: string;
  code: string;
  name: string;
  description: string;
  isSystem: boolean;
  userCount: number;
  permissions: string[];
}

export function RoleManagementPage() {
  const [roles, setRoles] = useState<IRole[]>([
    {
      id: 'ROLE-SYS-ADMIN',
      code: 'SYSTEM_ADMIN',
      name: 'Quản Trị Viên Hệ Thống Toàn Quyền',
      description: 'Toàn quyền cấu hình hệ thống, quản lý doanh nghiệp, gói cước và phân quyền menu',
      isSystem: true,
      userCount: 3,
      permissions: ['ALL'],
    },
    {
      id: 'ROLE-TENANT-ADMIN',
      code: 'TENANT_ADMIN',
      name: 'Quản Trị Doanh Nghiệp / Chủ Tài Khoản',
      description: 'Quản trị người dùng nội bộ, theo dõi gói cước, gia hạn hợp đồng và cấu hình phòng ban',
      isSystem: true,
      userCount: 8,
      permissions: ['SYS:USER:VIEW', 'SYS:USER:CREATE', 'SYS:ROLE:VIEW', 'DASHBOARD:VIEW', 'PROJECT:VIEW'],
    },
    {
      id: 'ROLE-BID-MANAGER',
      code: 'BID_MANAGER',
      name: 'Trưởng Ban Quản Lý Đấu Thầu (Bid Lead)',
      description: 'Tạo gói thầu, phân công nhiệm vụ, phê duyệt hồ sơ thầu 6 bước và quản lý tiến độ Kanban',
      isSystem: false,
      userCount: 15,
      permissions: ['PROJECT:VIEW', 'PROJECT:EDIT', 'KANBAN:VIEW', 'WORKFLOW:VIEW', 'WORKFLOW:APPROVE', 'TASK:VIEW'],
    },
    {
      id: 'ROLE-SOURCING',
      code: 'SOURCING_SPECIALIST',
      name: 'Chuyên Viên Sourcing & Mua Hàng XNK',
      description: 'Phát hành RFQ tới nhà cung cấp, lập ma trận so sánh giá đa tiền tệ và phân tích chi phí',
      isSystem: false,
      userCount: 24,
      permissions: ['SOURCING:VIEW', 'SOURCING:CREATE', 'MATRIX:VIEW', 'LOGISTICS:VIEW'],
    },
    {
      id: 'ROLE-LOGISTICS',
      code: 'LOGISTICS_COORDINATOR',
      name: 'Điều Phối Viên Logistics & Vận Đơn',
      description: 'Theo dõi vận đơn quốc tế, tính thuế hải quan, quản lý Incoterms và chi phí thông quan',
      isSystem: false,
      userCount: 12,
      permissions: ['LOGISTICS:VIEW', 'LOGISTICS:EDIT', 'DMS:VIEW'],
    },
  ]);

  const [selectedRole, setSelectedRole] = useState<IRole>(roles[0]);
  const [isEditingMatrix, setIsEditingMatrix] = useState(false);

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<IRole | null>(null);
  const [deletingRole, setDeletingRole] = useState<IRole | null>(null);

  // Form states for Create
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleCode, setNewRoleCode] = useState('');
  const [newRoleDesc, setNewRoleDesc] = useState('');

  const permissionMatrix = [
    {
      module: 'Quản Trị Hệ Thống & SaaS',
      items: [
        { code: 'SYS:USER:VIEW', name: 'Xem danh sách tài khoản người dùng' },
        { code: 'SYS:USER:CREATE', name: 'Thêm mới / Khóa tài khoản người dùng' },
        { code: 'SYS:ROLE:VIEW', name: 'Xem ma trận phân quyền vai trò' },
        { code: 'SYS:MENU:EDIT', name: 'Khai báo route & menu động' },
        { code: 'SYS:SUBSCRIPTION:RENEW', name: 'Gia hạn gói cước & thanh toán hóa đơn' },
      ],
    },
    {
      module: 'Quản Lý Đấu Thầu (Bidding)',
      items: [
        { code: 'PROJECT:VIEW', name: 'Xem danh sách gói thầu' },
        { code: 'PROJECT:EDIT', name: 'Tạo mới / Sửa thông tin gói thầu' },
        { code: 'KANBAN:VIEW', name: 'Xem và kéo thả tiến độ Kanban' },
        { code: 'WORKFLOW:VIEW', name: 'Xem quy trình hồ sơ thầu 6 bước' },
        { code: 'WORKFLOW:APPROVE', name: 'Phê duyệt thẩm định hồ sơ dự thầu' },
        { code: 'TASK:VIEW', name: 'Giao nhiệm vụ & phân công thành viên' },
      ],
    },
    {
      module: 'Sourcing & Nhà Cung Cấp',
      items: [
        { code: 'SOURCING:VIEW', name: 'Xem yêu cầu báo giá (RFQ)' },
        { code: 'SOURCING:CREATE', name: 'Tạo mới & gửi RFQ tới nhà cung cấp' },
        { code: 'MATRIX:VIEW', name: 'Xem & xuất ma trận so sánh giá' },
      ],
    },
    {
      module: 'Logistics & Kho Hồ Sơ (DMS)',
      items: [
        { code: 'LOGISTICS:VIEW', name: 'Xem vận đơn & chi phí hải quan' },
        { code: 'LOGISTICS:EDIT', name: 'Cập nhật Incoterms & thuế nhập khẩu' },
        { code: 'DMS:VIEW', name: 'Tra cứu & tải tài liệu số' },
      ],
    },
  ];

  const handleTogglePerm = (permCode: string) => {
    if (!isEditingMatrix || selectedRole.isSystem) return;
    const exists = selectedRole.permissions.includes(permCode);
    const updated = exists
      ? selectedRole.permissions.filter((p) => p !== permCode)
      : [...selectedRole.permissions, permCode];

    const updatedRole = { ...selectedRole, permissions: updated };
    setSelectedRole(updatedRole);
    setRoles((prev) => prev.map((r) => (r.id === updatedRole.id ? updatedRole : r)));
  };

  const handleSaveMatrix = () => {
    setIsEditingMatrix(false);
    alert('Cập nhật ma trận phân quyền cho vai trò ' + selectedRole.name + ' thành công!');
  };

  const handleCreateRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleName || !newRoleCode) return;

    const newR: IRole = {
      id: `ROLE-${Date.now()}`,
      code: newRoleCode.toUpperCase().trim(),
      name: newRoleName.trim(),
      description: newRoleDesc.trim() || 'Vai trò người dùng tùy chỉnh',
      isSystem: false,
      userCount: 0,
      permissions: ['DASHBOARD:VIEW', 'PROJECT:VIEW'],
    };

    setRoles([...roles, newR]);
    setSelectedRole(newR);
    setIsCreateModalOpen(false);
    setNewRoleName('');
    setNewRoleCode('');
    setNewRoleDesc('');
  };

  const handleUpdateRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRole) return;

    setRoles(roles.map((r) => (r.id === editingRole.id ? editingRole : r)));
    if (selectedRole.id === editingRole.id) {
      setSelectedRole(editingRole);
    }
    setEditingRole(null);
  };

  const handleDeleteRole = () => {
    if (!deletingRole || deletingRole.isSystem) return;

    const nextRoles = roles.filter((r) => r.id !== deletingRole.id);
    setRoles(nextRoles);
    if (selectedRole.id === deletingRole.id) {
      setSelectedRole(nextRoles[0] || roles[0]);
    }
    setDeletingRole(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Nhóm Quyền & Ma Trận Phân Quyền (RBAC Matrix)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Quản trị vai trò người dùng, cấp bậc thứ bậc và thiết lập ma trận phân quyền chi tiết cho hệ thống MIBID
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
        {/* Danh sách vai trò */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">Danh Sách Vai Trò ({roles.length})</h2>
          </div>
          
          <div className="space-y-2">
            {roles.map((role) => {
              const isSelected = selectedRole.id === role.id;
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
                          onClick={() => setEditingRole({ ...role })}
                          className="p-1 text-slate-400 hover:text-amber-600 rounded hover:bg-amber-50"
                          title="Sửa vai trò"
                        >
                          <Edit2 size={13} />
                        </button>
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
                    {role.description}
                  </p>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-200/60 dark:border-slate-800 text-xs">
                    <span className="font-mono text-blue-600 dark:text-blue-400 text-[11px] font-bold">{role.code}</span>
                    <span className="font-medium text-slate-600 dark:text-slate-300">
                      {role.userCount} nhân sự
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Ma trận chi tiết */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Shield size={20} className="text-blue-600" />
                Ma Trận Quyền Của [{selectedRole.name}]
              </h2>
              <p className="text-xs text-slate-500 font-mono mt-0.5">Mã Vai Trò: {selectedRole.code}</p>
            </div>

            {!selectedRole.isSystem && (
              <div>
                {isEditingMatrix ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsEditingMatrix(false)}
                      className="px-3.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl"
                    >
                      Hủy
                    </button>
                    <button
                      onClick={handleSaveMatrix}
                      className="flex items-center gap-1.5 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm shadow-blue-500/20"
                    >
                      <Save size={14} />
                      Lưu Thay Đổi
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsEditingMatrix(true)}
                    className="flex items-center gap-1.5 px-4 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl"
                  >
                    <Edit2 size={14} />
                    Chỉnh Sửa Quyền
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
                      selectedRole.permissions.includes('ALL') ||
                      selectedRole.permissions.includes(item.code);
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
        </div>
      </div>

      {/* Modal 1: Tạo Vai Trò Mới */}
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
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Tên Vai Trò</label>
                <input
                  type="text"
                  required
                  placeholder="VD: Kiểm Toán Viên Nội Bộ"
                  value={newRoleName}
                  onChange={(e) => setNewRoleName(e.target.value)}
                  className="w-full h-10 px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Mã Vai Trò (Code)</label>
                <input
                  type="text"
                  required
                  placeholder="VD: INTERNAL_AUDITOR"
                  value={newRoleCode}
                  onChange={(e) => setNewRoleCode(e.target.value)}
                  className="w-full h-10 px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs sm:text-sm font-mono font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none uppercase"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Mô Tả Nhiệm Vụ</label>
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

      {/* Modal 2: Chỉnh Sửa Vai Trò */}
      {editingRole && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Chỉnh Sửa Vai Trò</h3>
              <button
                type="button"
                onClick={() => setEditingRole(null)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateRole} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Mã Vai Trò</label>
                <input
                  type="text"
                  disabled
                  value={editingRole.code}
                  className="w-full h-10 px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 text-xs sm:text-sm font-mono font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Tên Vai Trò</label>
                <input
                  type="text"
                  required
                  value={editingRole.name}
                  onChange={(e) => setEditingRole({ ...editingRole, name: e.target.value })}
                  className="w-full h-10 px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Mô Tả Nhiệm Vụ</label>
                <textarea
                  rows={3}
                  value={editingRole.description}
                  onChange={(e) => setEditingRole({ ...editingRole, description: e.target.value })}
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingRole(null)}
                  className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20"
                >
                  Lưu Thay Đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 3: Xác Nhận Xóa Vai Trò */}
      {deletingRole && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <div className="p-2.5 rounded-2xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Xác Nhận Xóa Vai Trò</h3>
                <p className="text-xs text-slate-500">Hành động này không thể hoàn tác</p>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
              Bạn có chắc chắn muốn xóa vai trò tùy biến <strong className="text-slate-900 dark:text-white">{deletingRole.name}</strong> ({deletingRole.code})?
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
                className="px-5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-500/20"
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
