import { axiosInstance } from './instance';
import { ApiRoutes } from './apiRoutes';
import type { Street } from '@/types';

export const fetchStreets = async (districtId: string) => {
  const { data } = await axiosInstance.get<{
    success: boolean;
    data: Street[];
  }>(`${ApiRoutes.STREETS}?districtId=${districtId}`);
  return data?.data || [];
};
