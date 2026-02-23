import { axiosInstance } from './instance';
import { ApiRoutes } from './apiRoutes';
import type { Region } from '@/lib/generated/prisma/client';
import { RegionTableData } from '@/types';

export const fetchRegions = async () => {
  const { data } = await axiosInstance.get<{
    success: boolean;
    data: Region[];
  }>(ApiRoutes.MAP_REGIONS);
  return data?.data || [];
};

export const fetchRegionTableData = async (
  page: number,
  limit: number,
  search: string,
): Promise<RegionTableData> => {
  const { data } = await axiosInstance.get<{
    success: boolean;
    data: RegionTableData;
  }>(`${ApiRoutes.REGIONS}?page=${page}&limit=${limit}&search=${search}`);

  return (
    data.data || {
      data: [],
      total: 0,
      page: 1,
      limit: 10,
    }
  );
};
export const fetchRegionsList = async (): Promise<Region[]> => {
  const { data } = await axiosInstance.get<{
    success: boolean;
    data: Region[];
  }>(ApiRoutes.LIST_REGIONS);
  return data?.data || [];
};
