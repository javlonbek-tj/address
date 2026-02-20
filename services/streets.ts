import { axiosInstance } from './instance';
import { ApiRoutes } from './apiRoutes';
import type { Street as StreetModel } from '@/lib/generated/prisma/client';

export const fetchStreets = async (districtId: string) => {
  const { data } = await axiosInstance.get<{
    success: boolean;
    data: StreetModel[];
  }>(`${ApiRoutes.STREETS}?districtId=${districtId}`);
  return data?.data || [];
};
