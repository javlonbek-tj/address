import { axiosInstance } from './instance';
import { ApiRoutes } from './apiRoutes';
import { Mahalla } from '@/types';

export const fetchMahallas = async (districtId: string) => {
  const { data } = await axiosInstance.get<{
    success: boolean;
    data: Mahalla[];
  }>(`${ApiRoutes.MAHALLAS}?districtId=${districtId}`);
  return data?.data || [];
};
