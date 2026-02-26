import type { StreetWithMetadata } from '@/types';
import { fetchStreetListByDistrictId, fetchStreets } from '@/services';
import { useQuery } from '@tanstack/react-query';

export function useStreets(districtId: string) {
  const { data: streets = [], isLoading: isLoadingStreets } = useQuery<
    StreetWithMetadata[]
  >({
    queryKey: ['streets', 'full', districtId],
    queryFn: () => fetchStreets(districtId),
    enabled: !!districtId,
  });

  return { streets, isLoadingStreets };
}

export function useStreetsByDistrictId(districtId: string) {
  const { data: streets = [], isLoading: isLoadingStreets } = useQuery<
    {
      id: string;
      name: string;
      code: string;
    }[]
  >({
    queryKey: ['streets', 'list', districtId],
    queryFn: () => fetchStreetListByDistrictId(districtId),
    enabled: !!districtId,
  });

  return { streets, isLoadingStreets };
}
