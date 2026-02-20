import { CopyableCode } from '../shared';
import { TableActions } from './';
import type { TabType } from '@/types';

export interface BaseEntity {
  id: string;
  name: string;
  code: number;
}

interface Props<T extends BaseEntity> {
  data: T[];
  onEdit: (item: T) => void;
  onDelete: (id: string) => void;
}

export function DataTable<T extends BaseEntity>({
  data,
  onEdit,
  onDelete,
}: Props<T>) {
  return (
    <div className="bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
      <table className="relative w-full border-collapse">
        <thead className="top-0 z-10 sticky bg-gray-50/80 dark:bg-gray-700/80 backdrop-blur-md border-gray-200 dark:border-gray-700 border-b">
          <tr>
            <th className="px-6 py-4 font-bold text-gray-800 dark:text-gray-300 text-xs text-left uppercase leading-none tracking-widest">
              T/R
            </th>
            <th className="px-6 py-4 font-bold text-gray-800 dark:text-gray-300 text-xs text-left uppercase leading-none tracking-widest">
              Nomi
            </th>
            <th className="px-6 py-4 font-bold text-gray-800 dark:text-gray-300 text-xs text-left uppercase leading-none tracking-widest">
              Soato kodi
            </th>
            <th className="px-6 py-4 pr-12 font-bold text-gray-800 dark:text-gray-300 text-xs text-right uppercase leading-none tracking-widest">
              Amallar
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
          {data.length === 0 ? (
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
                  <td className="px-6 py-2 font-bold text-gray-600 dark:text-gray-300 text-xs whitespace-nowrap">
                    {index + 1}
                  </td>
                  <td className="px-6 py-2 font-bold text-gray-600 dark:text-gray-300 text-xs whitespace-nowrap">
                    {item.name}
                  </td>
                  <td className="px-6 py-2 font-bold text-gray-600 dark:text-gray-300 text-xs whitespace-nowrap">
                    <CopyableCode code={item.code.toString()} />
                  </td>
                  <td className="px-6 py-2 whitespace-nowrap">
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
  );
}
