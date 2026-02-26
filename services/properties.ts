import { axiosInstance } from './instance';
import { ApiRoutes } from './apiRoutes';
import type { PropertyForForm } from '@/types';

export async function fetchProperties(mahallaCode: string) {
  const { data } = await axiosInstance.get(ApiRoutes.MAP_PROPERTIES, {
    params: { mahallaCode },
  });
  return data.data;
}
export async function fetchPropertyById(id: string) {
  const { data } = await axiosInstance.get<{
    success: boolean;
    data: PropertyForForm;
  }>(`${ApiRoutes.PROPERTIES}/${id}`);
  return data.data;
}
