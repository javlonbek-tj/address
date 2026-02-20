import type { StreetWithMetadata } from '@/types';
import { fetchStreets } from '@/services';
import { useQuery } from '@tanstack/react-query';

export function useStreets(districtId: string) {
  const { data: streets = [], isLoading: isLoadingStreets } = useQuery<
    StreetWithMetadata[]
  >({
    queryKey: ['streets', districtId],
    queryFn: () => fetchStreets(districtId),
    enabled: !!districtId,
  });

  return { streets, isLoadingStreets };
}
