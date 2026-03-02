'use client';

import { UserTableFilters } from './UserTableFilters';
import {
  useTableFilters,
  useRegionsList,
  useDistrictsList,
  useTableActions,
  useDelete,
} from '@/hooks';
import { useUsersTableData } from '@/hooks/useUsers';
import { PaginationWrapper, Spinner } from '@/components/shared';
import { useSearchParams } from 'next/navigation';
import { TableActions } from '../table';
import { DeleteDialog } from '@/components/shared/modal';
import { deleteUser } from '@/app/actions/admin/user-action';
import { useQueryClient } from '@tanstack/react-query';
import { UserFormDialog } from './UserFormDialog';
import { Badge } from '@/components/ui/badge';

const roleLabels: any = {
  superadmin: 'Superadmin',
  admin: 'Admin',
  region_user: 'Viloyat',
  district_user: 'Tuman',
};

export function UserTable() {
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  const page = Number(searchParams.get('page')) || 1;
  const limit = Number(searchParams.get('limit')) || 10;
  const search = searchParams.get('search') || '';
  const role = searchParams.get('role') || 'all';
  const status = searchParams.get('status') || 'all';
  const regionId = searchParams.get('regionId') || 'all';
  const districtId = searchParams.get('districtId') || 'all';

  const { data: userTableData, isLoading: isLoadingUsers } = useUsersTableData({
    page,
    limit,
    search,
    role,
    status,
    regionId,
    districtId,
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
    handleCreate,
    handleCloseForm,
    editingItem,
    handleEdit,
    deleteId,
    setDeleteId,
    handleCloseDelete,
  } = useTableActions<any>();

  const { handleDelete, isDeleting } = useDelete(deleteUser, {
    onSuccess: () => {
      handleCloseDelete();
      queryClient.invalidateQueries({ queryKey: ['users-table'] });
    },
    successMessage: "Foydalanuvchi muvaffaqiyatli o'chirildi",
    errorMessage: "Foydalanuvchini o'chirishda xatolik yuz berdi",
  });

  const onRegionChange = (value: string) => {
    handleFilterChange({
      regionId: value,
      districtId: 'all',
    });
  };

  const users = userTableData?.data || [];
  const totalCount = userTableData?.total || 0;
  const totalPages = Math.ceil(totalCount / limit);
  const isLoading = isLoadingUsers || isLoadingRegions || isFilterLoading;

  const actualStartIndex = (page - 1) * limit;

  return (
    <div className='px-8 py-10'>
      <div className='bg-white dark:bg-gray-800 shadow-sm rounded-lg'>
        <UserTableFilters
          search={search}
          handleSearch={handleSearch}
          role={role}
          onRoleChange={(val) => handleFilterChange({ role: val })}
          status={status}
          onStatusChange={(val) => handleFilterChange({ status: val })}
          regionId={regionId}
          onRegionChange={onRegionChange}
          regions={regions}
          districtId={districtId}
          onDistrictChange={(val) => handleFilterChange({ districtId: val })}
          districts={districts}
          isLoadingDistricts={isLoadingDistricts}
          onAddClick={handleCreate}
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
                    F.I.SH
                  </th>
                  <th className='px-6 py-3 font-bold text-[10px] text-gray-800 dark:text-gray-300 3xl:text-xs text-left uppercase leading-none tracking-widest'>
                    Telefon
                  </th>
                  <th className='px-6 py-3 font-bold text-[10px] text-gray-800 dark:text-gray-300 3xl:text-xs text-left uppercase leading-none tracking-widest'>
                    Roli
                  </th>
                  <th className='px-6 py-3 font-bold text-[10px] text-gray-800 dark:text-gray-300 3xl:text-xs text-left uppercase leading-none tracking-widest'>
                    Lavozimi
                  </th>
                  <th className='px-6 py-3 font-bold text-[10px] text-gray-800 dark:text-gray-300 3xl:text-xs text-left uppercase leading-none tracking-widest'>
                    Hudud
                  </th>
                  <th className='px-6 py-3 font-bold text-[10px] text-gray-800 dark:text-gray-300 3xl:text-xs text-left uppercase leading-none tracking-widest'>
                    Holati
                  </th>
                  <th className='px-6 py-3 pr-8 2xl:pr-10 font-bold text-[10px] text-gray-800 dark:text-gray-300 3xl:text-xs text-right uppercase leading-none tracking-widest'>
                    Amallar
                  </th>
                </tr>
              </thead>
              <tbody
                className={`divide-y divide-gray-100 dark:divide-gray-700/50 transition-opacity duration-200 ${isLoading && users.length > 0 ? 'opacity-40 pointer-events-none' : ''}`}
              >
                {users.length === 0 && !isLoading ? (
                  <tr>
                    <td
                      colSpan={8}
                      className='px-6 py-12 font-medium text-gray-800 dark:text-gray-400 text-sm text-center'
                    >
                      Ma&apos;lumot topilmadi
                    </td>
                  </tr>
                ) : (
                  users.map((user: any, index: number) => (
                    <tr
                      key={user.id}
                      className='group hover:bg-blue-50/30 dark:hover:bg-blue-900/10 dark:even:bg-gray-700/20 dark:odd:bg-gray-800 even:bg-gray-50/50 odd:bg-white transition-all duration-200'
                    >
                      <td className='px-6 py-2 font-bold text-gray-600 dark:text-gray-300 text-xs whitespace-nowrap'>
                        {actualStartIndex + index + 1}
                      </td>
                      <td className='px-6 py-2 font-bold text-gray-600 dark:text-gray-300 text-xs whitespace-nowrap'>
                        {user.fullName}
                      </td>
                      <td className='px-6 py-2 font-bold text-gray-600 dark:text-gray-300 text-xs whitespace-nowrap'>
                        {user.phoneNumber}
                      </td>
                      <td className='px-6 py-2 text-gray-600 dark:text-gray-300 text-xs whitespace-nowrap'>
                        <Badge variant='outline' className='font-normal'>
                          {roleLabels[user.role] || user.role}
                        </Badge>
                      </td>
                      <td className='px-6 py-2 text-gray-600 dark:text-gray-300 text-xs whitespace-nowrap'>
                        {user.role === 'region_user'
                          ? user.position === 'boss'
                            ? "Sho'ba boshlig'i"
                            : 'Bosh mutaxassis'
                          : user.role === 'district_user'
                            ? 'Tuman xodimi'
                            : '-'}
                      </td>
                      <td className='px-6 py-2 text-gray-600 dark:text-gray-300 text-xs whitespace-nowrap'>
                        {user.district?.name || user.region?.name || '-'}
                      </td>
                      <td className='px-6 py-2 text-gray-600 dark:text-gray-300 text-xs whitespace-nowrap'>
                        <Badge
                          variant={
                            user.status === 'active'
                              ? 'secondary'
                              : 'destructive'
                          }
                          className={`font-normal ${user.status === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : ''}`}
                        >
                          {user.status === 'active' ? 'Faol' : 'Nofaol'}
                        </Badge>
                      </td>
                      <td className='px-6 py-2 whitespace-nowrap text-right'>
                        <TableActions
                          id={user.id}
                          onEdit={() => handleEdit(user)}
                          onDelete={() => setDeleteId(user.id)}
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

      <UserFormDialog
        open={isFormOpen}
        onClose={handleCloseForm}
        user={editingItem}
        regions={regions}
        districts={districts}
      />

      <DeleteDialog
        open={!!deleteId}
        onClose={handleCloseDelete}
        onConfirm={() => handleDelete(deleteId!)}
        isDeleting={isDeleting}
        title="Foydalanuvchini o'chirish"
        description="Haqiqatdan ham ushbu foydalanuvchini o'chirmoqchimisiz? Ushbu foydalanuvchi tizimda nofaol holatga keltiriladi."
      />
    </div>
  );
}
