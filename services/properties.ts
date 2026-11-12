import { axiosInstance } from './instance';
import { ApiRoutes } from './apiRoutes';
import type { PropertyDetail, PropertyListItem } from '@/types';

export const fetchProperties = async (districtId: string, mahallaId?: string) => {
  const { data } = await axiosInstance.get<{
    success: boolean;
    data: PropertyListItem[];
  }>(ApiRoutes.PROPERTIES, { params: { districtId, mahallaId } });
  return data?.data || [];
};

export const fetchPropertyById = async (id: string) => {
  const { data } = await axiosInstance.get<{
    success: boolean;
    data: PropertyDetail;
  }>(`${ApiRoutes.PROPERTIES}/${id}`);
  return data.data;
};
