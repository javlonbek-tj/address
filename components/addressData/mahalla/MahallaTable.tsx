'use client';

import { MahallaFormDialog, MahallaTableFilters } from './';
import type { District, Mahalla, Region } from '@/types';
import {
  useTableActions,
  useDelete,
  useTableFilters,
  useMahallasTableData,
  useRegionsList,
  useDistrictsList,
} from '@/hooks';
import { CopyableCode, PaginationWrapper, Spinner } from '@/components/shared';
import { TableActions } from '../table';
import { DeleteDialog } from '@/components/shared/modal';
import { deleteMahalla } from '@/app/actions/admin';
import { useSearchParams } from 'next/navigation';

export function MahallaTable() {
  const searchParams = useSearchParams();

  const page = Number(searchParams.get('page')) || 1;
  const limit = Number(searchParams.get('limit')) || 10;
  const search = searchParams.get('search') || '';
  const regionId = searchParams.get('regionId') || 'all';
  const districtId = searchParams.get('districtId') || 'all';
  const isOptimized = searchParams.get('isOptimized') || 'all';

  const { data: mahallaTableData, isLoadingMahallaTableData } =
    useMahallasTableData({
      page,
      limit,
      search,
      regionId,
      districtId,
      isOptimized,
    });

  const { regions, isLoadingRegions } = useRegionsList();
  const { districts, isLoadingDistricts } = useDistrictsList(regionId);

  const {
    handleSearch,
    handleFilterChange,
    isLoading: isFilterLoading,
    setIsPending,
  } = useTableFilters();

  const {
    isFormOpen,
    handleCloseForm,
    editingItem,
    handleEdit,
    deleteId,
    setDeleteId,
    handleCloseDelete,
  } = useTableActions<Mahalla>();

  const { handleDelete, isDeleting } = useDelete(deleteMahalla, {
    onSuccess: handleCloseDelete,
    successMessage: "Mahalla muvaffaqiyatli o'chirildi",
    errorMessage: "Mahallani o'chirishda xatolik yuz berdi",
  });

  const onRegionChange = (value: string) => {
    handleFilterChange({
      regionId: value,
      districtId: 'all',
    });
  };

  const mahallas = mahallaTableData?.data || [];
  const totalCount = mahallaTableData?.total || 0;
  const totalPages = Math.ceil(totalCount / limit);
  const isLoading =
    isLoadingMahallaTableData ||
    isLoadingRegions ||
    isLoadingDistricts ||
    isFilterLoading;

  const actualStartIndex = (page - 1) * limit;

  return (
    <div className='px-8 py-10'>
      <div className='bg-white dark:bg-gray-800 shadow-sm rounded-lg'>
        <MahallaTableFilters
          search={search}
          handleSearch={handleSearch}
          regionId={regionId}
          onRegionChange={onRegionChange}
          regions={regions}
          districtId={districtId}
          handleFilterChange={handleFilterChange}
          districts={districts}
          isLoadingDistricts={isLoadingDistricts}
          isOptimized={isOptimized}
        />

        <div className='p-4 overflow-hidden'>
          <div className='relative bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 rounded-lg min-h-50 overflow-x-auto'>
            {isLoading && <Spinner size='sm' />}
            <table className='relative w-full border-collapse'>
              <thead className='top-0 z-10 sticky bg-gray-50/80 dark:bg-gray-700/80 backdrop-blur-md dark:border-gray-700 border-b'>
                <tr>
                  <th className='px-6 py-3 font-bold text-[10px] text-gray-800 dark:text-gray-300 3xl:text-xs text-left uppercase leading-none tracking-widest'>
                    T/R
                  </th>
                  <th className='px-6 py-3 font-bold text-[10px] text-gray-800 dark:text-gray-300 3xl:text-xs text-left uppercase leading-none tracking-widest'>
                    Viloyat
                  </th>
                  <th className='px-6 py-3 font-bold text-[10px] text-gray-800 dark:text-gray-300 3xl:text-xs text-left uppercase leading-none tracking-widest'>
                    Tuman
                  </th>
                  <th className='px-6 py-3 font-bold text-[10px] text-gray-800 dark:text-gray-300 3xl:text-xs text-left uppercase leading-none tracking-widest'>
                    Uzkad Nomi
                  </th>
                  <th className='px-6 py-3 font-bold text-[10px] text-gray-800 dark:text-gray-300 3xl:text-xs text-left uppercase leading-none tracking-widest'>
                    Uzkad Kodi
                  </th>
                  <th className='px-6 py-3 font-bold text-[10px] text-gray-800 dark:text-gray-300 3xl:text-xs text-left uppercase leading-none tracking-widest'>
                    Apu Kodi
                  </th>
                  <th className='px-6 py-3 font-bold text-[10px] text-gray-800 dark:text-gray-300 3xl:text-xs text-left uppercase leading-none tracking-widest'>
                    1C Kodi
                  </th>
                  <th className='px-6 py-3 font-bold text-[10px] text-gray-800 dark:text-gray-300 3xl:text-xs text-left uppercase leading-none tracking-widest'>
                    Optimallashgan
                  </th>
                  <th className='px-6 py-3 pr-8 2xl:pr-10 font-bold text-[10px] text-gray-800 dark:text-gray-300 3xl:text-xs text-right uppercase leading-none tracking-widest'>
                    Amallar
                  </th>
                </tr>
              </thead>
              <tbody
                className={`divide-y divide-gray-100 dark:divide-gray-700/50 transition-opacity duration-200 ${isLoading && mahallas.length > 0 ? 'opacity-40 pointer-events-none' : ''}`}
              >
                {mahallas.length === 0 && !isLoading ? (
                  <tr>
                    <td
                      colSpan={11}
                      className='px-6 py-12 font-medium text-gray-800 dark:text-gray-400 text-sm text-center'
                    >
                      Ma&apos;lumot topilmadi
                    </td>
                  </tr>
                ) : (
                  mahallas.map((mahalla, index) => (
                    <tr
                      key={mahalla.id}
                      className={`group hover:bg-blue-50/30 dark:hover:bg-blue-900/10 dark:even:bg-gray-700/20 dark:odd:bg-gray-800 even:bg-gray-50/50 odd:bg-white transition-all duration-200 ${mahalla.mergedInto && mahalla.mergedInto.length > 0 ? 'opacity-60' : ''}`}
                    >
                      <td className='px-6 py-1 2xl:py-1.5 font-bold text-gray-600 dark:text-gray-300 text-xs whitespace-nowrap'>
                        {actualStartIndex + index + 1}
                      </td>
                      <td className='px-6 py-1 2xl:py-1.5 font-bold text-gray-600 dark:text-gray-300 text-xs whitespace-nowrap'>
                        {mahalla.district.region.name}
                      </td>
                      <td className='px-6 py-1 2xl:py-1.5 font-bold text-gray-600 dark:text-gray-300 text-xs whitespace-nowrap'>
                        {mahalla.district.name}
                      </td>
                      <td className='px-6 py-1 2xl:py-1.5 font-bold text-gray-600 dark:text-gray-300 text-xs whitespace-nowrap'>
                        {mahalla.uzKadName}
                      </td>
                      <td className='px-6 py-1 2xl:py-1.5 font-bold text-gray-600 dark:text-gray-300 text-xs whitespace-nowrap'>
                        <CopyableCode code={mahalla.code.toString()} />
                      </td>
                      <td className='px-6 py-1 2xl:py-1.5 font-bold text-gray-600 dark:text-gray-300 text-xs whitespace-nowrap'>
                        <CopyableCode code={mahalla.geoCode.toString()} />
                      </td>
                      <td className='px-6 py-1 2xl:py-1.5 font-bold text-gray-600 dark:text-gray-300 text-xs whitespace-nowrap'>
                        <CopyableCode code={mahalla.oneId} />
                      </td>
                      <td
                        className={
                          'px-6 py-1 2xl:py-1.5 font-bold text-gray-600 dark:text-gray-300 text-xs text-center whitespace-nowrap'
                        }
                      >
                        {mahalla.mergedInto && mahalla.mergedInto.length > 0 ? (
                          <span className='inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800/50'>
                            <svg
                              className='w-4 h-4'
                              fill='currentColor'
                              viewBox='0 0 20 20'
                            >
                              <path
                                fillRule='evenodd'
                                d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                                clipRule='evenodd'
                              />
                            </svg>
                          </span>
                        ) : (
                          <span className='text-green-500'>&mdash;</span>
                        )}
                      </td>
                      <td className='px-6 py-1 2xl:py-1.5 whitespace-nowrap'>
                        <TableActions
                          id={mahalla.id}
                          onEdit={() => handleEdit(mahalla)}
                          onDelete={() => setDeleteId(mahalla.id)}
                        />
                      </td>
                    </tr>
                  ))
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

      <MahallaFormDialog
        open={isFormOpen}
        onClose={handleCloseForm}
        mahalla={editingItem as Mahalla}
        regions={regions}
        districts={districts}
      />

      <DeleteDialog
        open={!!deleteId}
        onClose={handleCloseDelete}
        onConfirm={() => handleDelete(deleteId!)}
        isDeleting={isDeleting}
        title="Mahallani o'chirish"
        description="Haqiqatdan ham ushbu mahallani o'chirmoqchimisiz? Ushbu amalni ortga qaytarib bo'lmaydi."
      />
    </div>
  );
}
