import { axiosInstance } from './instance';
import { ApiRoutes } from './apiRoutes';
import type { Statistics } from '@/types';

export const fetchStatistics = async (
  regionId?: string,
  districtId?: string,
) => {
  const params = new URLSearchParams();
  if (districtId) params.set('districtId', districtId);
  else if (regionId) params.set('regionId', regionId);

  const { data } = await axiosInstance.get<{
    success: boolean;
    data: Statistics;
  }>(`${ApiRoutes.STATS}?${params.toString()}`);

  return data?.data || null;
};
