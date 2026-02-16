import { fetchDistricts } from '@/services';
import { useQuery } from '@tanstack/react-query';
import { District } from '@/types';

export function useDistricts(regionId: string) {
  const { data: districts = [], isLoading: isLoadingDistricts } = useQuery<
    District[]
  >({
    queryKey: ['districts', regionId],
    queryFn: () => fetchDistricts(regionId),
    enabled: !!regionId,
    staleTime: Infinity,
  });

  return { districts, isLoadingDistricts };
}
