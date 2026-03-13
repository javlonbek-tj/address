import { axiosInstance } from './instance';
import { ApiRoutes } from './apiRoutes';

export interface SessionParams {
  page?: number;
  limit?: number;
}

export const getSessions = async (params: SessionParams) => {
  const { data } = await axiosInstance.get(ApiRoutes.SESSIONS, { params });
  return data;
};
