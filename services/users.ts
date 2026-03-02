import { axiosInstance } from './instance';
import { ApiRoutes } from './apiRoutes';

export interface UserParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  status?: string;
  regionId?: string;
  districtId?: string;
}

export const getUsers = async (params: UserParams) => {
  const { data } = await axiosInstance.get(ApiRoutes.USERS, { params });
  return data;
};
