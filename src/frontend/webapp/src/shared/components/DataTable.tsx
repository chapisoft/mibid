import React from 'react';

export interface Column<T> {
  key: string;
  header: string;
  render?: (item: T, index: number) => React.ReactNode;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

export interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  selectedIds?: string[];
  onSelectionChange?: (ids: string[]) => void;
  onSelectRow?: (id: string) => void;
  onSelectAll?: () => void;
  renderActions?: (item: T, index: number) => React.ReactNode;
  renderRowActions?: (item: T, index: number) => React.ReactNode;
  loading?: boolean;
  emptyText?: string;
  getRowId?: (item: T) => string;
}

/**
 * DataTable Component chuẩn mực theo quy tắc UI MIBID:
 * Thứ tự cột bắt buộc: Cột 1 Checkbox → Cột 2 STT → Cột 3 Thao tác (Row Actions) → Cột 4+ Dữ liệu nghiệp vụ.
 */
export function DataTable<T>({
  data,
  columns,
  selectedIds = [],
  onSelectionChange,
  onSelectRow,
  onSelectAll,
  renderActions,
  renderRowActions,
  loading = false,
  emptyText = 'Không có dữ liệu hiển thị',
  getRowId = (item: T) => (item as Record<string, any>).id || '',
}: DataTableProps<T>) {
  const actionsRenderer = renderActions || renderRowActions;

  const handleSelectRow = (id: string) => {
    if (onSelectRow) {
      onSelectRow(id);
    } else if (onSelectionChange) {
      if (selectedIds.includes(id)) {
        onSelectionChange(selectedIds.filter((item) => item !== id));
      } else {
        onSelectionChange([...selectedIds, id]);
      }
    }
  };

  const handleSelectAll = () => {
    if (onSelectAll) {
      onSelectAll();
    } else if (onSelectionChange) {
      const allIds = data.map((item) => getRowId(item));
      const isAllSelected = data.length > 0 && allIds.every((id) => selectedIds.includes(id));
      if (isAllSelected) {
        onSelectionChange([]);
      } else {
        onSelectionChange(allIds);
      }
    }
  };

  const isAllSelected =
    data.length > 0 && data.every((item) => selectedIds.includes(getRowId(item)));

  const showCheckbox = Boolean(onSelectRow || onSelectionChange);

  return (
    <div className="w-full overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
      <table className="w-full text-left text-xs sm:text-sm text-slate-600 dark:text-slate-300">
        <thead className="bg-slate-50 dark:bg-slate-950 text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
          <tr>
            {/* CỘT 1: CHECKBOX */}
            {showCheckbox && (
              <th scope="col" className="p-4 w-10 text-center">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={handleSelectAll}
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
              </th>
            )}

            {/* CỘT 2: STT */}
            <th scope="col" className="px-3 py-3.5 w-14 text-center">
              STT
            </th>

            {/* CỘT 3: THAO TÁC (ROW ACTIONS) */}
            {actionsRenderer && (
              <th scope="col" className="px-4 py-3.5 w-32 text-center">
                Thao tác
              </th>
            )}

            {/* CỘT 4 TRỞ ĐI: DỮ LIỆU NGHIỆP VỤ */}
            {columns.map((col) => (
              <th
                key={col.key}
                scope="col"
                style={{ width: col.width }}
                className={`px-4 py-3.5 ${
                  col.align === 'center'
                    ? 'text-center'
                    : col.align === 'right'
                    ? 'text-right'
                    : 'text-left'
                }`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {loading ? (
            <tr>
              <td
                colSpan={columns.length + (showCheckbox ? 1 : 0) + 1 + (actionsRenderer ? 1 : 0)}
                className="px-6 py-10 text-center text-slate-400"
              >
                <div className="inline-flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                  Đang tải dữ liệu...
                </div>
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length + (showCheckbox ? 1 : 0) + 1 + (actionsRenderer ? 1 : 0)}
                className="px-6 py-10 text-center text-slate-400 dark:text-slate-500"
              >
                {emptyText}
              </td>
            </tr>
          ) : (
            data.map((item, index) => {
              const id = getRowId(item);
              const isSelected = selectedIds.includes(id);

              return (
                <tr
                  key={id || index}
                  className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors ${
                    isSelected ? 'bg-blue-50/50 dark:bg-blue-950/20' : ''
                  }`}
                >
                  {/* CỘT 1: CHECKBOX */}
                  {showCheckbox && (
                    <td className="p-4 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleSelectRow(id)}
                        className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                    </td>
                  )}

                  {/* CỘT 2: STT */}
                  <td className="px-3 py-4 text-center text-xs text-slate-400 font-mono">
                    {index + 1}
                  </td>

                  {/* CỘT 3: THAO TÁC */}
                  {actionsRenderer && (
                    <td className="px-4 py-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5">
                        {actionsRenderer(item, index)}
                      </div>
                    </td>
                  )}

                  {/* CỘT 4+: DỮ LIỆU */}
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={`px-4 py-4 ${
                        col.align === 'center'
                          ? 'text-center'
                          : col.align === 'right'
                          ? 'text-right'
                          : 'text-left'
                      }`}
                    >
                      {col.render
                        ? col.render(item, index)
                        : (item as Record<string, any>)[col.key] ?? '—'}
                    </td>
                  ))}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
