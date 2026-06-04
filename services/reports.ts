import { axiosInstance } from './instance';
import { ApiRoutes } from './apiRoutes';
import type { StreetsReportData } from '@/types';

export const fetchStreetsReport = async (params?: {
  regionId?: string;
  districtId?: string;
}) => {
  const { data } = await axiosInstance.get<{
    success: boolean;
    data: StreetsReportData;
  }>(ApiRoutes.REPORTS_STREETS, { params });
  return data?.data;
};
