import { axiosInstance } from './instance';
import { ApiRoutes } from './apiRoutes';
import type { Property, PropertyTableData } from '@/types';

export async function fetchProperties(mahallaCode: string) {
  const { data } = await axiosInstance.get(ApiRoutes.MAP_PROPERTIES, {
    params: { mahallaCode },
  });
  return data.data;
}
export async function fetchPropertyById(id: string) {
  const { data } = await axiosInstance.get<{
    success: boolean;
    data: Property;
  }>(`${ApiRoutes.PROPERTIES}/${id}`);
  return data.data;
}

export const fetchPropertyTableData = async (
  page = 1,
  limit = 10,
  search = '',
  regionId = '',
  districtId = '',
  mahallaId = '',
  streetId = '',
  isNew = '',
): Promise<PropertyTableData> => {
  const { data } = await axiosInstance.get<{
    success: boolean;
    data: PropertyTableData;
  }>(ApiRoutes.PROPERTIES, {
    params: {
      page,
      limit,
      search,
      regionId,
      districtId,
      mahallaId,
      streetId,
      isNew,
    },
  });
  return data?.data;
};
