import { Region } from '@/lib/generated/prisma/client';

interface Props {
  regions: Region[];
}

export function RegionTable({ regions }: Props) {
  return (
    <div className='border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden bg-white dark:bg-gray-800 shadow-sm'>
      <table className='relative w-full border-collapse'>
        <thead className='sticky top-0 z-10 bg-gray-50/80 dark:bg-gray-700/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700'>
          <tr>
            <th className='px-6 py-4 text-left text-[10px] font-bold text-gray-800 dark:text-gray-300 uppercase tracking-widest leading-none'>
              T/R
            </th>
            <th className='px-6 py-4 text-left text-[10px] font-bold text-gray-800 dark:text-gray-300 uppercase tracking-widest leading-none'>
              Nomi
            </th>
            <th className='px-6 py-4 text-right text-[10px] font-bold text-gray-800 dark:text-gray-300 uppercase tracking-widest leading-none'>
              Soato kodi
            </th>
            <th className='px-6 py-4 text-center text-[10px] font-bold text-gray-800 dark:text-gray-300 uppercase tracking-widest leading-none'>
              Amallar
            </th>
          </tr>
        </thead>
        <tbody className='divide-y divide-gray-100 dark:divide-gray-700/50'>
          {regions.length === 0 ? (
            <tr>
              <td colSpan={4} className='px-6 py-12 text-center'>
                <div className='text-sm text-gray-800 dark:text-gray-400 font-medium'>
                  Ma&apos;lumot topilmadi
                </div>
              </td>
            </tr>
          ) : (
            regions.map((item, index) => {
              return (
                <tr
                  key={item.id}
                  className={`group transition-all duration-200`}
                >
                  <td className='px-6 py-4 whitespace-nowrap text-[11px] font-bold text-gray-600 dark:text-gray-300'>
                    {index + 1}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-[11px] font-bold text-gray-600 dark:text-gray-300'>
                    {item.name}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-[11px] font-bold text-gray-600 dark:text-gray-300'>
                    {item.code}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-[11px] font-bold text-gray-600 dark:text-gray-300'>
                    {item.id}
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
