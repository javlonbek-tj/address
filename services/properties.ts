import { axiosInstance } from './instance';
import { ApiRoutes } from './apiRoutes';
import type { PropertyDetail, PropertyListItem, ReservedNumberRow, StreetNumbers } from '@/types';

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

export const fetchStreetNumbers = async (streetId: string) => {
  const { data } = await axiosInstance.get<{
    success: boolean;
    data: StreetNumbers;
  }>(`${ApiRoutes.PROPERTIES}/street-numbers`, { params: { streetId } });
  return data.data;
};

export const fetchReservedNumbers = async (districtId: string) => {
  const { data } = await axiosInstance.get<{
    success: boolean;
    data: ReservedNumberRow[];
  }>(`${ApiRoutes.PROPERTIES}/reserved`, { params: { districtId } });
  return data?.data || [];
};
