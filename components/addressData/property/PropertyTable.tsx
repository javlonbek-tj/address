'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';

import { PropertyTableFilters } from './PropertyTableFilters';
import { UpdatePropertyDialog } from './UpdatePropertyDialog';
import type { Property } from '@/types';
import {
  useTableFilters,
  useRegionsList,
  useDistrictsList,
  useMahallasList,
  useStreetsByDistrictId,
  usePropertiesTableData,
  useTableActions,
  useDelete,
} from '@/hooks';
import { CopyableCode, PaginationWrapper, Spinner } from '@/components/shared';
import { TableActions } from '../table';
import { DeleteDialog } from '@/components/shared/modal';
import { deleteProperty } from '@/app/actions';

interface PropertyTableProps {
  isSuperadmin?: boolean;
  isRegionLocked?: boolean;
  isDistrictLocked?: boolean;
  userRegionId?: string | null;
  userDistrictId?: string | null;
}

export function PropertyTable({
  isSuperadmin = false,
  isRegionLocked = false,
  isDistrictLocked = false,
  userRegionId = null,
  userDistrictId = null,
}: PropertyTableProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();

  const page = Number(searchParams.get('page')) || 1;
  const limit = Number(searchParams.get('limit')) || 10;
  const search = searchParams.get('search') || '';
  const regionId = isDistrictLocked || isRegionLocked
    ? (userRegionId ?? 'all')
    : searchParams.get('regionId') || 'all';
  const districtId = isDistrictLocked && userDistrictId
    ? userDistrictId
    : searchParams.get('districtId') || 'all';
  const mahallaId = searchParams.get('mahallaId') || 'all';
  const streetId = searchParams.get('streetId') || 'all';
  const isNew = searchParams.get('isNew') || 'all';

  const { data: propertyTableData, isLoadingPropertyTableData } =
    usePropertiesTableData({
      page,
      limit,
      search,
      regionId,
      districtId,
      mahallaId,
      streetId,
      isNew,
    });

  const { regions, isLoadingRegions } = useRegionsList();
  const { districts, isLoadingDistricts } = useDistrictsList(regionId);
  const { mahallas, isLoadingMahallas } = useMahallasList(districtId);
  const { streets, isLoadingStreets } = useStreetsByDistrictId(districtId);

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
  } = useTableActions<Property>();

  const { handleDelete, isDeleting } = useDelete(deleteProperty, {
    onSuccess: () => {
      handleCloseDelete();
      queryClient.invalidateQueries({ queryKey: ['properties-table'] });
      queryClient.invalidateQueries({ queryKey: ['properties-map'] });
    },
    successMessage: "Ko'chmas mulk muvaffaqiyatli o'chirildi",
    errorMessage: "Ko'chmas mulkni o'chirishda xatolik yuz berdi",
  });

  const onRegionChange = (value: string) => {
    handleFilterChange({
      regionId: value,
      districtId: 'all',
      mahallaId: 'all',
      streetId: 'all',
    });
  };

  const onDistrictChange = (value: string) => {
    handleFilterChange({
      districtId: value,
      mahallaId: 'all',
      streetId: 'all',
    });
  };

  const onMahallaChange = (value: string) => {
    handleFilterChange({
      mahallaId: value,
      streetId: 'all',
    });
  };

  const properties = propertyTableData?.data || [];
  const totalCount = propertyTableData?.total || 0;
  const totalPages = Math.ceil(totalCount / limit);
  const isLoading =
    isLoadingPropertyTableData ||
    isLoadingRegions ||
    isLoadingDistricts ||
    isLoadingMahallas ||
    isLoadingStreets ||
    isFilterLoading;

  const actualStartIndex = (page - 1) * limit;

  return (
    <div className='px-8 py-10'>
      <div className='bg-white dark:bg-gray-800 shadow-sm rounded-lg'>
        <PropertyTableFilters
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
          onMahallaChange={onMahallaChange}
          mahallas={mahallas}
          isLoadingMahallas={isLoadingMahallas}
          streetId={streetId}
          handleFilterChange={handleFilterChange}
          streets={streets}
          isLoadingStreets={isLoadingStreets}
          isNew={isNew}
          isRegionLocked={isRegionLocked}
          isDistrictLocked={isDistrictLocked}
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
                  {!isRegionLocked && !isDistrictLocked && (
                    <th className='px-6 py-3 font-bold text-[10px] text-gray-800 dark:text-gray-300 3xl:text-xs text-left uppercase leading-none tracking-widest'>
                      Viloyat
                    </th>
                  )}
                  {!isDistrictLocked && (
                    <th className='px-6 py-3 font-bold text-[10px] text-gray-800 dark:text-gray-300 3xl:text-xs text-left uppercase leading-none tracking-widest'>
                      Tuman
                    </th>
                  )}
                  <th className='px-6 py-3 font-bold text-[10px] text-gray-800 dark:text-gray-300 3xl:text-xs text-left uppercase leading-none tracking-widest'>
                    Mahalla
                  </th>
                  <th className='px-6 py-3 font-bold text-[10px] text-gray-800 dark:text-gray-300 3xl:text-xs text-left uppercase leading-none tracking-widest'>
                    Ko&apos;cha
                  </th>
                  <th className='px-6 py-3 font-bold text-[10px] text-gray-800 dark:text-gray-300 3xl:text-xs text-left uppercase leading-none tracking-widest'>
                    Yangi kadastr
                  </th>
                  <th className='px-6 py-3 font-bold text-[10px] text-gray-800 dark:text-gray-300 3xl:text-xs text-left uppercase leading-none tracking-widest'>
                    Eski kadastr
                  </th>
                  <th className='px-6 py-3 font-bold text-[10px] text-gray-800 dark:text-gray-300 3xl:text-xs text-left uppercase leading-none tracking-widest'>
                    Yangi uy raqami
                  </th>
                  <th className='px-6 py-3 font-bold text-[10px] text-gray-800 dark:text-gray-300 3xl:text-xs text-center uppercase leading-none tracking-widest'>
                    Holati
                  </th>
                  <th className='px-6 py-3 pr-8 2xl:pr-10 font-bold text-[10px] text-gray-800 dark:text-gray-300 3xl:text-xs text-right uppercase leading-none tracking-widest'>
                    Amallar
                  </th>
                </tr>
              </thead>
              <tbody
                className={`divide-y divide-gray-100 dark:divide-gray-700/50 transition-opacity duration-200 ${isLoading && properties.length > 0 ? 'opacity-40 pointer-events-none' : ''}`}
              >
                {properties.length === 0 && !isLoading ? (
                  <tr>
                      <td
                        colSpan={
                          10 -
                          (isRegionLocked || isDistrictLocked ? 1 : 0) -
                          (isDistrictLocked ? 1 : 0)
                        }
                        className='px-6 py-12 font-medium text-gray-800 dark:text-gray-400 text-sm text-center'
                      >
                      Ma&apos;lumot topilmadi
                    </td>
                  </tr>
                ) : (
                  properties.map((property, index) => (
                    <tr
                      key={property.id}
                      className='group hover:bg-blue-50/30 dark:hover:bg-blue-900/10 dark:even:bg-gray-700/20 dark:odd:bg-gray-800 even:bg-gray-50/50 odd:bg-white transition-all duration-200'
                    >
                      <td className='px-6 py-2 font-bold text-gray-600 dark:text-gray-300 text-xs whitespace-nowrap'>
                        {actualStartIndex + index + 1}
                      </td>
                      {!isRegionLocked && !isDistrictLocked && (
                        <td className='px-6 py-2 font-bold text-gray-600 dark:text-gray-300 text-xs whitespace-nowrap'>
                          {property.district.region.name}
                        </td>
                      )}
                      {!isDistrictLocked && (
                        <td className='px-6 py-2 font-bold text-gray-600 dark:text-gray-300 text-xs whitespace-nowrap'>
                          {property.district.name}
                        </td>
                      )}
                      <td className='px-6 py-2 font-bold text-gray-600 dark:text-gray-300 text-xs whitespace-nowrap'>
                        {property.mahalla?.name}
                      </td>
                      <td className='px-6 py-2 font-bold text-gray-600 dark:text-gray-300 text-xs whitespace-nowrap'>
                        {property.street?.name || '-'}
                      </td>
                      <td className='px-6 py-2 font-bold text-gray-600 dark:text-gray-300 text-xs whitespace-nowrap'>
                        <CopyableCode code={property.newCadNumber || '-'} />
                      </td>
                      <td className='px-6 py-2 font-bold text-gray-600 dark:text-gray-300 text-xs whitespace-nowrap'>
                        <CopyableCode code={property.cadNumber || '-'} />
                      </td>
                      <td className='px-6 py-2 font-bold text-gray-600 text-center dark:text-gray-300 text-xs whitespace-nowrap'>
                        {property.newHouseNumber || '-'}
                      </td>
                      <td className='px-6 py-2 font-bold text-gray-600 text-center dark:text-gray-300 text-xs whitespace-nowrap'>
                        <span
                          className={`px-2 py-1 rounded-full text-[10px] ${property.isNew ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'}`}
                        >
                          {property.isNew ? 'Yangi' : 'Eski'}
                        </span>
                      </td>
                      <td className='px-6 py-2 whitespace-nowrap text-right'>
                        <TableActions
                          id={property.id}
                          onEdit={() => handleEdit(property)}
                          onDelete={() => setDeleteId(property.id)}
                          onView={() =>
                            router.push(`/properties/${property.id}`)
                          }
                          showEditDelete={isSuperadmin}
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

      {isFormOpen && editingItem && (
        <UpdatePropertyDialog
          open={isFormOpen}
          onClose={handleCloseForm}
          property={editingItem}
          regions={regions}
          districts={districts}
        />
      )}

      <DeleteDialog
        open={!!deleteId}
        onClose={handleCloseDelete}
        onConfirm={() => handleDelete(deleteId!)}
        isDeleting={isDeleting}
        title="Ko'chmas mulkni o'chirish"
        description="Haqiqatdan ham ushbu ko'chmas mulkni o'chirmoqchimisiz? Ushbu amalni ortga qaytarib bo'lmaydi."
      />
    </div>
  );
}
