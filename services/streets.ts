import { axiosInstance } from './instance';
import { ApiRoutes } from './apiRoutes';
import type { StreetTableData, StreetWithMetadata } from '@/types';

export const fetchStreets = async (districtId: string) => {
  const { data } = await axiosInstance.get<{
    success: boolean;
    data: StreetWithMetadata[];
  }>(`${ApiRoutes.MAP_STREETS}?districtId=${districtId}`);
  return data?.data || [];
};

export const fetchStreetListByDistrictId = async (districtId: string) => {
  const { data } = await axiosInstance.get<{
    success: boolean;
    data: { id: string; name: string; code: string }[];
  }>(`${ApiRoutes.STREETS}/${districtId}`);
  return data?.data || [];
};

export const fetchStreetTableData = async (
  page = 1,
  limit = 10,
  search = '',
  regionId = '',
  districtId = '',
  mahallaId = '',
  streetType = 'all',
  uzKadFilter = 'all',
) => {
  const { data } = await axiosInstance.get<{
    success: boolean;
    data: StreetTableData;
  }>(ApiRoutes.STREETS, {
    params: {
      page,
      limit,
      search,
      regionId,
      districtId,
      mahallaId,
      streetType,
      uzKadFilter,
    },
  });
  return data?.data;
};

export const fetchStreetTypes = async (): Promise<string[]> => {
  const { data } = await axiosInstance.get<{
    success: boolean;
    data: string[];
  }>(ApiRoutes.STREET_TYPES);
  return data?.data ?? [];
};
