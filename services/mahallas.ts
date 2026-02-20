import { axiosInstance } from './instance';
import { ApiRoutes } from './apiRoutes';
import type { Mahalla as MahallaModel } from '@/lib/generated/prisma/client';

export const fetchMahallas = async (districtId: string) => {
  const { data } = await axiosInstance.get<{
    success: boolean;
    data: MahallaModel[];
  }>(`${ApiRoutes.MAHALLAS}?districtId=${districtId}`);
  return data?.data || [];
};
