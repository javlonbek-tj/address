import { useQuery } from '@tanstack/react-query';
import { fetchStreetsReport } from '@/services';
import type { StreetsReportData } from '@/types';

export function useStreetsReport(params?: {
  regionId?: string;
  districtId?: string;
}) {
  const { data, isPending: isLoading } = useQuery<StreetsReportData>({
    queryKey: ['streets-report', params?.regionId, params?.districtId],
    queryFn: () => fetchStreetsReport(params),
    staleTime: 30_000,
  });

  return { data, isLoading };
}
