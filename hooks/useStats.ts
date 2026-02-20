import { useQuery } from '@tanstack/react-query';
import { fetchStatistics } from '@/services/stats';
import type { Statistics } from '@/types';

export function useStats(regionId?: string, districtId?: string) {
  const { data: statistics = null, isLoading: isLoadingStats } =
    useQuery<Statistics | null>({
      queryKey: ['stats', regionId, districtId],
      queryFn: () => fetchStatistics(regionId, districtId),
    });

  return { statistics, isLoadingStats };
}
