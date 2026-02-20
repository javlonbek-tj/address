import { axiosInstance } from './instance';
import { ApiRoutes } from './apiRoutes';
import type { MahallaWithRelations } from '@/types';

export const fetchMahallas = async (districtId: string) => {
  const { data } = await axiosInstance.get<{
    success: boolean;
    data: MahallaWithRelations[];
  }>(`${ApiRoutes.MAHALLAS}?districtId=${districtId}`);
  return data?.data || [];
};
