'use client';

import { useState, useEffect } from 'react';
import { MahallaFormDialog } from './';
import type { Mahalla, Region, District } from '@/types';
import { useTableActions, useDelete, useTableFilters } from '@/hooks';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CopyableCode, PaginationWrapper, Spinner } from '@/components/shared';
import { TableActions } from '../table';
import { DeleteDialog } from '@/components/shared/modal';
import { deleteMahalla } from '@/app/actions/admin';
import { fetchDistricts } from '@/services/districts';

interface Props {
  mahallas: Mahalla[];
  regions: Region[];
  initialDistricts?: District[];
  totalCount: number;
  currentPage: number;
  pageSize: number;
  totalPages: number;
  search: string;
  regionId: string;
  districtId: string;
}

export function MahallaTable({
  mahallas,
  regions,
  initialDistricts = [],
  totalCount,
  currentPage,
  pageSize,
  totalPages,
  search,
  regionId,
  districtId,
}: Props) {
  const { handleSearch, handleFilterChange, isLoading, setIsPending } =
    useTableFilters();
  const [districts, setDistricts] = useState<District[]>(initialDistricts);
  const [isDistrictsLoading, setIsDistrictsLoading] = useState(false);

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

  // Fetch districts when regionId changes
  useEffect(() => {
    if (regionId === 'all') {
      setDistricts([]);
      return;
    }

    const loadDistricts = async () => {
      setIsDistrictsLoading(true);
      try {
        const data = await fetchDistricts(regionId);
        setDistricts(data as unknown as District[]);
      } catch (error) {
        console.error('Error loading districts:', error);
      } finally {
        setIsDistrictsLoading(false);
      }
    };

    loadDistricts();
  }, [regionId]);

  const onRegionChange = (value: string) => {
    handleFilterChange('regionId', value);
    handleFilterChange('districtId', 'all'); // Reset district when region changes
  };

  const actualStartIndex = (currentPage - 1) * pageSize;

  return (
    <div className="px-8 py-10">
      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg">
        <div className="flex flex-wrap items-center gap-3 p-4 border-gray-100 dark:border-gray-700 border-b">
          <Input
            placeholder="Qidiruv..."
            className="shadow-sm w-52 h-8"
            defaultValue={search}
            onChange={(e) => handleSearch(e.target.value)}
          />

          <Select value={regionId} onValueChange={onRegionChange}>
            <SelectTrigger
              className="dark:bg-gray-700 shadow-sm w-52 dark:text-white"
              size="sm"
            >
              <SelectValue
                placeholder="Viloyat bo'yicha filter"
                className="text-xs 3xl:text-sm"
              />
            </SelectTrigger>
            <SelectContent className="dark:bg-gray-700 dark:text-white">
              <SelectItem value="all" className="text-xs 3xl:text-sm">
                Barcha viloyatlar
              </SelectItem>
              {regions.map((region) => (
                <SelectItem
                  key={region.id}
                  value={region.id}
                  className="text-xs 3xl:text-sm"
                >
                  {region.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={districtId}
            onValueChange={(value) => handleFilterChange('districtId', value)}
            disabled={regionId === 'all' || isDistrictsLoading}
          >
            <SelectTrigger
              className="dark:bg-gray-700 shadow-sm w-52 dark:text-white"
              size="sm"
            >
              <SelectValue
                placeholder={
                  isDistrictsLoading
                    ? 'Yuklanmoqda...'
                    : "Tuman bo'yicha filter"
                }
                className="text-xs 3xl:text-sm"
              />
            </SelectTrigger>
            <SelectContent className="dark:bg-gray-700 dark:text-white">
              <SelectItem value="all" className="text-xs 3xl:text-sm">
                Barcha tumanlar
              </SelectItem>
              {districts.map((district) => (
                <SelectItem
                  key={district.id}
                  value={district.id}
                  className="text-xs 3xl:text-sm"
                >
                  {district.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="p-4 overflow-hidden">
          <div className="relative bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 rounded-lg min-h-50 overflow-x-auto">
            {isLoading && <Spinner size="sm" />}
            <table className="relative w-full border-collapse">
              <thead className="top-0 z-10 sticky bg-gray-50/80 dark:bg-gray-700/80 backdrop-blur-md dark:border-gray-700 border-b">
                <tr>
                  <th className="px-6 py-4 font-bold text-[10px] text-gray-800 dark:text-gray-300 3xl:text-xs text-left uppercase leading-none tracking-widest">
                    T/R
                  </th>
                  <th className="px-6 py-4 font-bold text-[10px] text-gray-800 dark:text-gray-300 3xl:text-xs text-left uppercase leading-none tracking-widest">
                    Viloyat
                  </th>
                  <th className="px-6 py-4 font-bold text-[10px] text-gray-800 dark:text-gray-300 3xl:text-xs text-left uppercase leading-none tracking-widest">
                    Tuman
                  </th>
                  <th className="px-6 py-4 font-bold text-[10px] text-gray-800 dark:text-gray-300 3xl:text-xs text-left uppercase leading-none tracking-widest">
                    Uzkad Nomi
                  </th>
                  <th className="px-6 py-4 font-bold text-[10px] text-gray-800 dark:text-gray-300 3xl:text-xs text-left uppercase leading-none tracking-widest">
                    Uzkad Kodi
                  </th>
                  <th className="px-6 py-4 font-bold text-[10px] text-gray-800 dark:text-gray-300 3xl:text-xs text-left uppercase leading-none tracking-widest">
                    Apu Kodi
                  </th>
                  <th className="px-6 py-4 font-bold text-[10px] text-gray-800 dark:text-gray-300 3xl:text-xs text-left uppercase leading-none tracking-widest">
                    1C Kodi
                  </th>
                  <th className="px-6 py-4 font-bold text-[10px] text-gray-800 dark:text-gray-300 3xl:text-xs text-left uppercase leading-none tracking-widest">
                    Optimallashgan
                  </th>
                  <th className="px-6 py-4 pr-8 font-bold text-[10px] text-gray-800 dark:text-gray-300 3xl:text-xs text-right uppercase leading-none tracking-widest">
                    Amallar
                  </th>
                </tr>
              </thead>
              <tbody
                className={`divide-y divide-gray-100 dark:divide-gray-700/50 transition-opacity duration-200 ${isLoading && mahallas.length > 0 ? 'opacity-40 pointer-events-none' : ''}`}
              >
                {mahallas.length === 0 ? (
                  <tr>
                    <td
                      colSpan={11}
                      className="px-6 py-12 font-medium text-gray-800 dark:text-gray-400 text-sm text-center"
                    >
                      Ma&apos;lumot topilmadi
                    </td>
                  </tr>
                ) : (
                  mahallas.map((mahalla, index) => (
                    <tr
                      key={mahalla.id}
                      className="group hover:bg-blue-50/30 dark:hover:bg-blue-900/10 dark:even:bg-gray-700/20 dark:odd:bg-gray-800 even:bg-gray-50/50 odd:bg-white transition-all duration-200"
                    >
                      <td className="px-6 py-1 font-bold text-gray-600 dark:text-gray-300 text-xs whitespace-nowrap">
                        {actualStartIndex + index + 1}
                      </td>
                      <td className="px-6 py-1 font-bold text-gray-600 dark:text-gray-300 text-xs whitespace-nowrap">
                        {mahalla.district.region.name}
                      </td>
                      <td className="px-6 py-1 font-bold text-gray-600 dark:text-gray-300 text-xs whitespace-nowrap">
                        {mahalla.district.name}
                      </td>
                      <td className="px-6 py-1 font-bold text-gray-600 dark:text-gray-300 text-xs whitespace-nowrap">
                        {mahalla.uzKadName}
                      </td>
                      <td className="px-6 py-1 font-bold text-gray-600 dark:text-gray-300 text-xs whitespace-nowrap">
                        <CopyableCode code={mahalla.code.toString()} />
                      </td>
                      <td className="px-6 py-1 font-bold text-gray-600 dark:text-gray-300 text-xs whitespace-nowrap">
                        <CopyableCode code={mahalla.geoCode.toString()} />
                      </td>
                      <td className="px-6 py-1 font-bold text-gray-600 dark:text-gray-300 text-xs whitespace-nowrap">
                        <CopyableCode code={mahalla.oneId} />
                      </td>
                      <td className="px-6 py-1 font-bold text-gray-600 dark:text-gray-300 text-xs whitespace-nowrap">
                        {mahalla.mergedIntoName ? (
                          <span className="font-medium text-orange-500">
                            {mahalla.mergedIntoName} ga biriktirilgan
                          </span>
                        ) : (
                          <span className="text-green-500">Yo&apos;q</span>
                        )}
                      </td>
                      <td className="px-6 py-1 whitespace-nowrap">
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
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalCount}
                itemsPerPage={pageSize}
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
