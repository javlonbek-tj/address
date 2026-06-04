'use client';

import { useState } from 'react';
import { useStreetsReport } from '@/hooks';
import { Spinner } from '@/components/shared';
import { ReportsSummaryCards } from './ReportsSummaryCards';
import { ReportsFilters } from './ReportsFilters';
import { DistrictReportRow } from './DistrictReportRow';

interface Props {
  showRegionFilter: boolean;
  lockedRegionId?: string | null;
  lockedDistrictId?: string | null;
}

export function ReportsTable({
  showRegionFilter,
  lockedRegionId,
  lockedDistrictId,
}: Props) {
  const [selectedRegionId, setSelectedRegionId] = useState<string>('all');

  const regionId = lockedRegionId
    ? lockedRegionId
    : selectedRegionId === 'all'
      ? undefined
      : selectedRegionId;

  const districtId = lockedDistrictId ?? undefined;

  const { data, isLoading } = useStreetsReport({ regionId, districtId });

  const districts = data?.districts ?? [];
  const summary = data?.summary;
  const showRegion = showRegionFilter || (!lockedRegionId && !lockedDistrictId);

  return (
    <div>
      {summary && <ReportsSummaryCards summary={summary} />}

      <ReportsFilters
        showRegionFilter={showRegionFilter}
        regionId={selectedRegionId}
        onRegionChange={setSelectedRegionId}
      />

      <div className='px-8 py-6'>
        <div className='bg-white dark:bg-gray-800 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden'>
          <div className='relative min-h-32 overflow-x-auto'>
            {isLoading && <Spinner size='sm' />}
            <table
              className={`w-full border-collapse transition-opacity duration-200 ${isLoading ? 'opacity-40 pointer-events-none' : ''}`}
            >
              <thead className='top-0 z-10 sticky bg-gray-50/80 dark:bg-gray-700/80 backdrop-blur-md border-b dark:border-gray-700'>
                <tr>
                  {[
                    'T/R',
                    ...(showRegion ? ['Viloyat'] : []),
                    'Tuman',
                    "Jami ko'chalar",
                    'UzKad qoʻyilgan',
                    'UzKad qoʻyilmagan',
                    'Bugun qoʻyilgan',
                  ].map((h) => (
                    <th
                      key={h}
                      className='px-6 py-3 font-bold text-[10px] text-gray-800 dark:text-gray-300 3xl:text-xs text-left uppercase leading-none tracking-widest'
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className='divide-y divide-gray-100 dark:divide-gray-700/50'>
                {districts.length === 0 && !isLoading ? (
                  <tr>
                    <td
                      colSpan={showRegion ? 7 : 6}
                      className='px-6 py-12 text-sm text-gray-500 dark:text-gray-400 text-center'
                    >
                      Ma&apos;lumot topilmadi
                    </td>
                  </tr>
                ) : (
                  districts.map((row, i) => (
                    <DistrictReportRow
                      key={row.districtId}
                      row={row}
                      index={i}
                      showRegion={showRegion}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
