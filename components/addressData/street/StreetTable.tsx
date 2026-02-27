'use client';

import { StreetTableFilters } from './';
import type { Street } from '@/types';
import {
  useTableActions,
  useDelete,
  useTableFilters,
  useStreetsTableData,
  useRegionsList,
  useDistrictsList,
  useMahallasList,
} from '@/hooks';
import { CopyableCode, PaginationWrapper, Spinner } from '@/components/shared';
import { TableActions } from '../table';
import { DeleteDialog } from '@/components/shared/modal';
import { deleteStreet } from '@/app/actions';
import { useSearchParams } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';

export function StreetTable() {
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  const page = Number(searchParams.get('page')) || 1;
  const limit = Number(searchParams.get('limit')) || 10;
  const search = searchParams.get('search') || '';
  const regionId = searchParams.get('regionId') || 'all';
  const districtId = searchParams.get('districtId') || 'all';
  const mahallaId = searchParams.get('mahallaId') || 'all';

  const { data: streetTableData, isLoadingStreetTableData } =
    useStreetsTableData({
      page,
      limit,
      search,
      regionId,
      districtId,
      mahallaId,
    });

  const { regions, isLoadingRegions } = useRegionsList();
  const { districts, isLoadingDistricts } = useDistrictsList(regionId);
  const { mahallas, isLoadingMahallas } = useMahallasList(districtId);

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
  } = useTableActions<Street>();

  const { handleDelete, isDeleting } = useDelete(deleteStreet, {
    onSuccess: () => {
      handleCloseDelete();
      queryClient.invalidateQueries({
        queryKey: ['streets-map', districtId],
      });
      queryClient.invalidateQueries({ queryKey: ['streets-table'] });
    },
    successMessage: "Ko'cha muvaffaqiyatli o'chirildi",
    errorMessage: "Ko'chani o'chirishda xatolik yuz berdi",
  });

  const onRegionChange = (value: string) => {
    handleFilterChange({
      regionId: value,
      districtId: 'all',
      mahallaId: 'all',
    });
  };

  const onDistrictChange = (value: string) => {
    handleFilterChange({
      districtId: value,
      mahallaId: 'all',
    });
  };

  const streets = streetTableData?.data || [];
  const totalCount = streetTableData?.total || 0;
  const totalPages = Math.ceil(totalCount / limit);
  const isLoading =
    isLoadingStreetTableData ||
    isLoadingRegions ||
    isLoadingDistricts ||
    isLoadingMahallas ||
    isFilterLoading;

  const actualStartIndex = (page - 1) * limit;

  return (
    <div className='px-8 py-10'>
      <div className='bg-white dark:bg-gray-800 shadow-sm rounded-lg'>
        <StreetTableFilters
          search={search}
          handleSearch={handleSearch}
          regionId={regionId}
          onRegionChange={onRegionChange}
          regions={regions}
          districtId={districtId}
          onDistrictChange={onDistrictChange}
          districts={districts}
          isLoadingDistricts={isLoadingDistricts}
          mahallaId={mahallaId}
          handleFilterChange={handleFilterChange}
          mahallas={mahallas}
          isLoadingMahallas={isLoadingMahallas}
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
                    Nomi
                  </th>
                  <th className='px-6 py-3 font-bold text-[10px] text-gray-800 dark:text-gray-300 3xl:text-xs text-left uppercase leading-none tracking-widest'>
                    Turi
                  </th>
                  <th className='px-6 py-3 font-bold text-[10px] text-gray-800 dark:text-gray-300 3xl:text-xs text-left uppercase leading-none tracking-widest'>
                    Kodi
                  </th>
                  <th className='px-6 py-3 font-bold text-[10px] text-gray-800 dark:text-gray-300 3xl:text-xs text-left uppercase leading-none tracking-widest'>
                    Mahalla bog&apos;lanish
                  </th>
                  <th className='px-6 py-3 font-bold text-[10px] text-gray-800 dark:text-gray-300 3xl:text-xs text-left uppercase leading-none tracking-widest'>
                    Uzkad kodi
                  </th>
                  <th className='px-6 py-3 pr-8 2xl:pr-10 font-bold text-[10px] text-gray-800 dark:text-gray-300 3xl:text-xs text-right uppercase leading-none tracking-widest'>
                    Amallar
                  </th>
                </tr>
              </thead>
              <tbody
                className={`divide-y divide-gray-100 dark:divide-gray-700/50 transition-opacity duration-200 ${isLoading && streets.length > 0 ? 'opacity-40 pointer-events-none' : ''}`}
              >
                {streets.length === 0 && !isLoading ? (
                  <tr>
                    <td
                      colSpan={9}
                      className='px-6 py-12 font-medium text-gray-800 dark:text-gray-400 text-sm text-center'
                    >
                      Ma&apos;lumot topilmadi
                    </td>
                  </tr>
                ) : (
                  streets.map((street, index) => (
                    <tr
                      key={street.id}
                      className='group hover:bg-blue-50/30 dark:hover:bg-blue-900/10 dark:even:bg-gray-700/20 dark:odd:bg-gray-800 even:bg-gray-50/50 odd:bg-white transition-all duration-200'
                    >
                      <td className='px-6 py-2 font-bold text-gray-600 dark:text-gray-300 text-xs whitespace-nowrap'>
                        {actualStartIndex + index + 1}
                      </td>
                      <td className='px-6 py-2 font-bold text-gray-600 dark:text-gray-300 text-xs whitespace-nowrap'>
                        {street.district.region.name}
                      </td>
                      <td className='px-6 py-2 font-bold text-gray-600 dark:text-gray-300 text-xs whitespace-nowrap'>
                        {street.district.name}
                      </td>
                      <td className='px-6 py-2 font-bold text-gray-600 dark:text-gray-300 text-xs whitespace-nowrap'>
                        {street.name}
                      </td>
                      <td className='px-6 py-2 font-bold text-gray-600 dark:text-gray-300 text-xs whitespace-nowrap'>
                        {street.type}
                      </td>
                      <td className='px-6 py-2 font-bold text-gray-600 dark:text-gray-300 text-xs whitespace-nowrap'>
                        <CopyableCode code={street.code} />
                      </td>
                      <td className='px-6 py-2 font-bold text-gray-600 dark:text-gray-300 text-xs whitespace-nowrap'>
                        {street.mahalla.name}
                      </td>
                      <td className='px-6 py-2 font-bold text-gray-600 dark:text-gray-300 text-xs whitespace-nowrap'>
                        <CopyableCode code={street.uzKadCode} />
                      </td>
                      <td className='px-6 py-2 whitespace-nowrap'>
                        <TableActions
                          id={street.id}
                          onEdit={() => handleEdit(street)}
                          onDelete={() => setDeleteId(street.id)}
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

      {/* StreetFormDialog will be implemented later if needed */}
      {/* <StreetFormDialog
        open={isFormOpen}
        onClose={handleCloseForm}
        street={editingItem as Street}
        regions={regions}
        districts={districts}
      /> */}

      <DeleteDialog
        open={!!deleteId}
        onClose={handleCloseDelete}
        onConfirm={() => handleDelete(deleteId!)}
        isDeleting={isDeleting}
        title="Ko'chani o'chirish"
        description="Haqiqatdan ham ushbu ko'chani o'chirmoqchimisiz? Ushbu amalni ortga qaytarib bo'lmaydi."
      />
    </div>
  );
}
