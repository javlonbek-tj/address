import { axiosInstance } from './instance';
import { ApiRoutes } from './apiRoutes';
import type { District } from '@/lib/generated/prisma/client';

export const fetchDistricts = async (regionId: string) => {
  const { data } = await axiosInstance.get<{
    success: boolean;
    data: District[];
  }>(`${ApiRoutes.DISTRICTS}?regionId=${regionId}`);
  return data?.data || [];
};
