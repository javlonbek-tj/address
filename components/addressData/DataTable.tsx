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
  activeTab: TabType;
}

export function DataTable<T extends BaseEntity>({
  data,
  onEdit,
  onDelete,
  activeTab,
}: Props<T>) {
  return (
    <div className='border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden bg-white dark:bg-gray-800 shadow-sm'>
      <table className='relative w-full border-collapse'>
        <thead className='sticky top-0 z-10 bg-gray-50/80 dark:bg-gray-700/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700'>
          <tr>
            <th className='px-6 py-4 text-left text-xs font-bold text-gray-800 dark:text-gray-300 uppercase tracking-widest leading-none'>
              T/R
            </th>
            <th className='px-6 py-4 text-left text-xs font-bold text-gray-800 dark:text-gray-300 uppercase tracking-widest leading-none'>
              Nomi
            </th>
            <th className='px-6 py-4 text-left text-xs font-bold text-gray-800 dark:text-gray-300 uppercase tracking-widest leading-none'>
              Soato kodi
            </th>
            <th className='px-6 pr-12 py-4 text-right text-xs font-bold text-gray-800 dark:text-gray-300 uppercase tracking-widest leading-none'>
              Amallar
            </th>
          </tr>
        </thead>
        <tbody className='divide-y divide-gray-100 dark:divide-gray-700/50'>
          {data.length === 0 ? (
            <tr>
              <td colSpan={4} className='px-6 py-12 text-center'>
                <div className='text-sm text-gray-800 dark:text-gray-400 font-medium'>
                  Ma&apos;lumot topilmadi
                </div>
              </td>
            </tr>
          ) : (
            data.map((item, index) => {
              return (
                <tr
                  key={item.id}
                  className='group transition-all duration-200
                             odd:bg-white even:bg-gray-50/50
                             dark:odd:bg-gray-800 dark:even:bg-gray-700/20
                             hover:bg-blue-50/30 dark:hover:bg-blue-900/10'
                >
                  <td className='px-6 py-2 whitespace-nowrap text-xs font-bold text-gray-600 dark:text-gray-300'>
                    {index + 1}
                  </td>
                  <td className='px-6 py-2 whitespace-nowrap text-xs font-bold text-gray-600 dark:text-gray-300'>
                    {item.name}
                  </td>
                  <td className='px-6 py-2 whitespace-nowrap text-xs font-bold text-gray-600 dark:text-gray-300'>
                    <CopyableCode code={item.code.toString()} />
                  </td>
                  <td className='px-6 py-2 whitespace-nowrap '>
                    <TableActions
                      id={item.id}
                      onEdit={() => onEdit(item)}
                      onDelete={() => onDelete(item.id)}
                      activeTab={activeTab}
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
