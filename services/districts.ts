import { axiosInstance } from './instance';
import { ApiRoutes } from './apiRoutes';
import type { District } from '@/lib/generated/prisma/client';
import { DistrictTableData } from '@/types';

export const fetchDistricts = async (regionId: string) => {
  const { data } = await axiosInstance.get<{
    success: boolean;
    data: District[];
  }>(`${ApiRoutes.MAP_DISTRICTS}?regionId=${regionId}`);
  return data?.data || [];
};

export const fetchDistrictTableData = async (
  page: number,
  limit: number,
  search: string,
  regionId: string,
) => {
  const { data } = await axiosInstance.get<{
    success: boolean;
    data: DistrictTableData;
  }>(
    `${ApiRoutes.DISTRICTS}?page=${page}&limit=${limit}&search=${search}&regionId=${regionId}`,
  );
  return (
    data?.data || {
      data: [],
      total: 0,
      page: 1,
      limit: 10,
    }
  );
};
export const fetchDistrictsList = async (
  regionId?: string,
): Promise<District[]> => {
  const url = regionId
    ? `${ApiRoutes.LIST_DISTRICTS}?regionId=${regionId}`
    : ApiRoutes.LIST_DISTRICTS;
  const { data } = await axiosInstance.get<{
    success: boolean;
    data: District[];
  }>(url);
  return data?.data || [];
};
