import { axiosInstance } from './instance';
import { ApiRoutes } from './apiRoutes';
import type { MahallaTableData, MahallaWithRelations } from '@/types';

export const fetchMahallas = async (districtId: string) => {
  const { data } = await axiosInstance.get<{
    success: boolean;
    data: MahallaWithRelations[];
  }>(`${ApiRoutes.MAP_MAHALLAS}?districtId=${districtId}`);
  return data?.data || [];
};

export const fetchMahallaTableData = async (
  page: number,
  limit: number,
  search: string,
  regionId: string,
  districtId: string,
  isOptimized: string,
) => {
  const { data } = await axiosInstance.get<{
    success: boolean;
    data: MahallaTableData;
  }>(
    `${ApiRoutes.MAHALLAS}?page=${page}&limit=${limit}&search=${search}&regionId=${regionId}&districtId=${districtId}&isOptimized=${isOptimized}`,
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

export const fetchMahallaByCode = async (code: string) => {
  const { data } = await axiosInstance.get<{
    success: boolean;
    data: { uzKadName: string; id: string };
  }>(`${ApiRoutes.MAHALLAS}/${code}`);
  return data?.data || null;
};

export const fetchMahallasList = async (
  districtId?: string,
): Promise<{ id: string; name: string; code: string }[]> => {
  const url = districtId
    ? `${ApiRoutes.LIST_MAHALLAS}?districtId=${districtId}`
    : ApiRoutes.LIST_MAHALLAS;
  const { data } = await axiosInstance.get<{
    success: boolean;
    data: { id: string; name: string; code: string }[];
  }>(url);
  return data?.data || [];
};
