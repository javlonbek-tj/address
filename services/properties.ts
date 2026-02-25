import { axiosInstance } from './instance';
import { ApiRoutes } from './apiRoutes';

export async function fetchProperties(mahallaCode: string) {
  const { data } = await axiosInstance.get(ApiRoutes.MAP_PROPERTIES, {
    params: { mahallaCode },
  });
  return data.data;
}
