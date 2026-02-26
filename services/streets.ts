import { axiosInstance } from './instance';
import { ApiRoutes } from './apiRoutes';
import type { StreetWithMetadata } from '@/types';

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
