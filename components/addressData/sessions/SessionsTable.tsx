'use client';

import { useSearchParams } from 'next/navigation';
import { useSessionsTableData } from '@/hooks';
import { PaginationWrapper, Spinner } from '@/components/shared';
import { Badge } from '@/components/ui/badge';
import { formatDate, parseUserAgent } from '@/lib/utils';
import { useTableFilters } from '@/hooks';

export function SessionsTable() {
  const searchParams = useSearchParams();
  const page = Number(searchParams.get('page')) || 1;
  const limit = Number(searchParams.get('limit')) || 10;

  const { data, isLoading } = useSessionsTableData({ page, limit });
  const { setIsPending } = useTableFilters();

  const sessions = data?.data || [];
  const totalCount = data?.total || 0;
  const totalPages = Math.ceil(totalCount / limit);
  const actualStartIndex = (page - 1) * limit;

  return (
    <div className='px-8 py-10'>
      <div className='bg-white dark:bg-gray-800 shadow-sm rounded-lg'>
        <div className='px-6 py-4 border-b border-gray-200 dark:border-gray-700'>
          <h2 className='text-base font-semibold text-gray-800 dark:text-gray-100'>
            Seanslar tarixi
          </h2>
        </div>

        <div className='p-4 overflow-hidden'>
          <div className='relative bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 rounded-lg min-h-50 overflow-x-auto'>
            {isLoading && <Spinner size='sm' />}
            <table className='relative w-full border-collapse'>
              <thead className='top-0 z-10 sticky bg-gray-50/80 dark:bg-gray-700/80 backdrop-blur-md border-b dark:border-gray-700'>
                <tr>
                  <th className='px-6 py-3 font-bold text-[10px] text-gray-800 dark:text-gray-300 text-left uppercase leading-none tracking-widest'>
                    T/R
                  </th>
                  <th className='px-6 py-3 font-bold text-[10px] text-gray-800 dark:text-gray-300 text-left uppercase leading-none tracking-widest'>
                    Foydalanuvchi
                  </th>
                  <th className='px-6 py-3 font-bold text-[10px] text-gray-800 dark:text-gray-300 text-left uppercase leading-none tracking-widest'>
                    IP manzil
                  </th>
                  <th className='px-6 py-3 font-bold text-[10px] text-gray-800 dark:text-gray-300 text-left uppercase leading-none tracking-widest'>
                    Yaratilgan sana
                  </th>
                  <th className='px-6 py-3 font-bold text-[10px] text-gray-800 dark:text-gray-300 text-left uppercase leading-none tracking-widest'>
                    Holati
                  </th>
                  <th className='px-6 py-3 font-bold text-[10px] text-gray-800 dark:text-gray-300 text-left uppercase leading-none tracking-widest'>
                    Oxirgi faoliyat vaqti
                  </th>
                  <th className='px-6 py-3 font-bold text-[10px] text-gray-800 dark:text-gray-300 text-left uppercase leading-none tracking-widest'>
                    Qo&apos;shimcha ma&apos;lumotlar
                  </th>
                </tr>
              </thead>
              <tbody
                className={`divide-y divide-gray-100 dark:divide-gray-700/50 transition-opacity duration-200 ${
                  isLoading && sessions.length > 0
                    ? 'opacity-40 pointer-events-none'
                    : ''
                }`}
              >
                {sessions.length === 0 && !isLoading ? (
                  <tr>
                    <td
                      colSpan={7}
                      className='px-6 py-12 font-medium text-gray-800 dark:text-gray-400 text-sm text-center'
                    >
                      Ma&apos;lumot topilmadi
                    </td>
                  </tr>
                ) : (
                  sessions.map((session: any, index: number) => {
                    const isActive = new Date(session.expiresAt) > new Date();
                    const fullName =
                      session.user?.appUser?.fullName ||
                      session.user?.username ||
                      '—';

                    return (
                      <tr
                        key={session.id}
                        className='group hover:bg-blue-50/30 dark:hover:bg-blue-900/10 dark:even:bg-gray-700/20 dark:odd:bg-gray-800 even:bg-gray-50/50 odd:bg-white transition-all duration-200'
                      >
                        <td className='px-6 py-2 font-bold text-gray-600 dark:text-gray-300 text-xs whitespace-nowrap'>
                          {actualStartIndex + index + 1}
                        </td>
                        <td className='px-6 py-2 font-bold text-gray-600 dark:text-gray-300 text-xs whitespace-nowrap'>
                          {fullName}
                        </td>
                        <td className='px-6 py-2 font-bold text-gray-600 dark:text-gray-300 text-xs whitespace-nowrap'>
                          {session.ipAddress || '—'}
                        </td>
                        <td className='px-6 py-2 text-gray-600 dark:text-gray-300 text-xs whitespace-nowrap'>
                          {formatDate(session.createdAt)}
                        </td>
                        <td className='px-6 py-2 whitespace-nowrap'>
                          <Badge
                            variant='outline'
                            className={
                              isActive
                                ? 'border-green-500 text-green-600 dark:text-green-400'
                                : 'border-red-400 text-red-500 dark:text-red-400'
                            }
                          >
                            {isActive ? 'Faol' : 'Faol emas'}
                          </Badge>
                        </td>
                        <td className='px-6 py-2 text-gray-600 dark:text-gray-300 text-xs whitespace-nowrap'>
                          {formatDate(session.updatedAt)}
                        </td>
                        <td className='px-6 py-2 text-gray-600 dark:text-gray-300 text-xs whitespace-nowrap'>
                          {parseUserAgent(session.userAgent)}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div
              className={`transition-opacity duration-200 ${
                isLoading ? 'opacity-40 pointer-events-none' : ''
              }`}
            >
              <PaginationWrapper
                currentPage={page}
                totalPages={totalPages}
                totalItems={totalCount}
                itemsPerPage={limit}
                setIsPending={setIsPending}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
