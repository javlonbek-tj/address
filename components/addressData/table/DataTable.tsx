'use client';

import { CopyableCode, PaginationWrapper, Spinner } from '@/components/shared';
import { TableActions } from './TableActions';

export interface BaseEntity {
  id: string;
  name: string;
  code: string;
}

interface Props<T extends BaseEntity> {
  data: T[];
  onEdit: (item: T) => void;
  onDelete: (id: string) => void;
  startIndex?: number;
  isLoading?: boolean;
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    setIsPending: (value: boolean) => void;
  };
}

export function DataTable<T extends BaseEntity>({
  data,
  onEdit,
  onDelete,
  startIndex,
  isLoading,
  pagination,
}: Props<T>) {
  const actualStartIndex =
    startIndex ??
    (pagination ? (pagination.currentPage - 1) * pagination.itemsPerPage : 0);
  return (
    <div className="p-4 overflow-hidden">
      <div className="relative bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 rounded-lg min-h-50 overflow-x-auto">
        {isLoading && <Spinner size="sm" />}
        <table className="relative w-full border-collapse">
          <thead className="top-0 z-10 sticky bg-gray-50/80 dark:bg-gray-700/80 backdrop-blur-md border-gray-200 dark:border-gray-700 border-b">
            <tr>
              <th className="px-6 py-3 font-bold text-[10px] text-gray-800 dark:text-gray-300 3xl:text-xs text-left uppercase leading-none tracking-widest">
                T/R
              </th>
              <th className="px-6 py-3 font-bold text-[10px] text-gray-800 dark:text-gray-300 3xl:text-xs text-left uppercase leading-none tracking-widest">
                Nomi
              </th>
              <th className="px-6 py-3 font-bold text-[10px] text-gray-800 dark:text-gray-300 3xl:text-xs text-left uppercase leading-none tracking-widest">
                Soato kodi
              </th>
              <th className="px-6 py-3 pr-8 2xl:pr-10 font-bold text-[10px] text-gray-800 dark:text-gray-300 3xl:text-xs text-right uppercase leading-none tracking-widest">
                Amallar
              </th>
            </tr>
          </thead>
          <tbody
            className={`divide-y divide-gray-100 dark:divide-gray-700/50 transition-opacity duration-200 ${
              isLoading && data.length > 0
                ? 'opacity-40 pointer-events-none'
                : ''
            }`}
          >
            {isLoading && data.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center">
                  <div className="h-24" />
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center">
                  <div className="font-medium text-gray-800 dark:text-gray-400 text-sm">
                    Ma&apos;lumot topilmadi
                  </div>
                </td>
              </tr>
            ) : (
              data.map((item, index) => {
                return (
                  <tr
                    key={item.id}
                    className="group hover:bg-blue-50/30 dark:hover:bg-blue-900/10 dark:even:bg-gray-700/20 dark:odd:bg-gray-800 even:bg-gray-50/50 odd:bg-white transition-all duration-200"
                  >
                    <td className="px-6 py-1 2xl:py-1.5 font-bold text-gray-600 dark:text-gray-300 text-xs 3xl:text-sm whitespace-nowrap">
                      {actualStartIndex + index + 1}
                    </td>
                    <td className="px-6 py-1 2xl:py-1.5 font-bold text-gray-600 dark:text-gray-300 text-xs 3xl:text-sm whitespace-nowrap">
                      {item.name}
                    </td>
                    <td className="px-6 py-1 2xl:py-1.5 font-bold text-gray-600 dark:text-gray-300 text-xs 3xl:text-sm whitespace-nowrap">
                      <CopyableCode code={item.code.toString()} />
                    </td>
                    <td className="px-6 py-1 2xl:py-1.5 whitespace-nowrap">
                      <TableActions
                        id={item.id}
                        onEdit={() => onEdit(item)}
                        onDelete={() => onDelete(item.id)}
                      />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      {pagination && pagination.totalPages > 1 && (
        <div
          className={`transition-opacity duration-200 ${
            isLoading ? 'opacity-40 pointer-events-none' : ''
          }`}
        >
          <PaginationWrapper {...pagination} />
        </div>
      )}
    </div>
  );
}
