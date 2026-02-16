import { axiosInstance } from './instance';
import { ApiRoutes } from './apiRoutes';
import { District } from '@/types';

export const fetchDistricts = async (regionId: string) => {
  return (
    await axiosInstance.get<District[]>(
      `${ApiRoutes.DISTRICTS}?regionId=${regionId}`,
    )
  ).data;
};
