'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useStreetsReport } from '@/hooks';
import { Spinner, PaginationWrapper } from '@/components/shared';
import { ReportsSummaryCards } from './ReportsSummaryCards';
import { RegionReportRow } from './RegionReportRow';
import { DistrictReportRow } from './DistrictReportRow';
import { ArrowLeft } from 'lucide-react';

interface Props {
  isAdmin: boolean;
  lockedRegionId?: string | null;
  lockedDistrictId?: string | null;
}

const ITEMS_PER_PAGE = 10;

export function ReportsTable({ isAdmin, lockedRegionId, lockedDistrictId }: Props) {
  const searchParams = useSearchParams();
  const page = Number(searchParams.get('page')) || 1;
  const limit = Number(searchParams.get('limit')) || ITEMS_PER_PAGE;

  // Admin can drill into a region; locked users can't change scope
  const [drillRegionId, setDrillRegionId] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  const regionId = lockedRegionId ?? drillRegionId ?? undefined;
  const districtId = lockedDistrictId ?? undefined;

  const { data, isLoading } = useStreetsReport({ regionId, districtId });

  const mode = data?.mode ?? (regionId ? 'districts' : 'regions');
  const allItems = mode === 'regions' ? (data?.regions ?? []) : (data?.districts ?? []);
  const summary = data?.summary;

  // Client-side pagination
  const totalItems = allItems.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / limit));
  const safePage = Math.min(page, totalPages);
  const startIndex = (safePage - 1) * limit;
  const pageItems = allItems.slice(startIndex, startIndex + limit);

  const statHeaders = ["Jami ko'chalar", 'UzKad qoʻyilgan', 'UzKad qoʻyilmagan', 'Kunlik', 'Haftalik', 'Oylik'];
  const regionHeaders = ['T/R', 'Viloyat', ...statHeaders];
  const districtHeaders = ['T/R', ...(isAdmin ? ['Viloyat'] : []), 'Tuman', ...statHeaders];
  const headers = mode === 'regions' ? regionHeaders : districtHeaders;

  const canDrillBack = isAdmin && drillRegionId;

  return (
    <div>
      {summary && <ReportsSummaryCards summary={summary} />}

      <div className='px-8 pt-6 pb-2 flex items-center gap-3'>
        {canDrillBack && (
          <button
            onClick={() => setDrillRegionId(null)}
            className='flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer'
          >
            <ArrowLeft className='w-3.5 h-3.5' />
            Viloyatlarga qaytish
          </button>
        )}
        {data && (
          <span className='text-xs text-gray-500 dark:text-gray-400'>
            {mode === 'regions'
              ? 'Viloyat tanlang — tumanlar statistikasini ko\'rish uchun'
              : drillRegionId
                ? data.districts[0]?.regionName ?? ''
                : lockedRegionId
                  ? data.districts[0]?.regionName ?? ''
                  : ''}
          </span>
        )}
      </div>

      <div className='px-8 pb-6'>
        <div className='bg-white dark:bg-gray-800 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden'>
          <div className='relative min-h-32 overflow-x-auto'>
            {(isLoading || isPending) && <Spinner size='sm' />}
            <table
              className={`w-full border-collapse transition-opacity duration-200 ${isLoading || isPending ? 'opacity-40 pointer-events-none' : ''}`}
            >
              <thead className='top-0 z-10 sticky bg-gray-50/80 dark:bg-gray-700/80 backdrop-blur-md border-b dark:border-gray-700'>
                <tr>
                  {headers.map((h) => (
                    <th
                      key={h}
                      className='px-6 py-3 font-bold text-[10px] text-gray-800 dark:text-gray-300 3xl:text-xs text-left uppercase leading-none tracking-widest whitespace-nowrap'
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className='divide-y divide-gray-100 dark:divide-gray-700/50'>
                {pageItems.length === 0 && !isLoading ? (
                  <tr>
                    <td
                      colSpan={headers.length}
                      className='px-6 py-12 text-sm text-gray-500 dark:text-gray-400 text-center'
                    >
                      Ma&apos;lumot topilmadi
                    </td>
                  </tr>
                ) : mode === 'regions' ? (
                  (pageItems as typeof data.regions).map((row, i) => (
                    <RegionReportRow
                      key={row.regionId}
                      row={row}
                      index={startIndex + i}
                      onSelect={setDrillRegionId}
                    />
                  ))
                ) : (
                  (pageItems as typeof data.districts).map((row, i) => (
                    <DistrictReportRow
                      key={row.districtId}
                      row={row}
                      index={startIndex + i}
                      showRegion={isAdmin}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>

          {totalItems > limit && (
            <div className={`px-6 pb-4 transition-opacity duration-200 ${isPending ? 'opacity-40 pointer-events-none' : ''}`}>
              <PaginationWrapper
                currentPage={safePage}
                totalPages={totalPages}
                totalItems={totalItems}
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
