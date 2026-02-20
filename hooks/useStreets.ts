import type { Street as StreetModel } from '@/lib/generated/prisma/client';
import { fetchStreets } from '@/services';
import { useQuery } from '@tanstack/react-query';

export function useStreets(districtId: string) {
  const { data: streets = [], isLoading: isLoadingStreets } = useQuery<
    StreetModel[]
  >({
    queryKey: ['streets', districtId],
    queryFn: () => fetchStreets(districtId),
    enabled: !!districtId,
  });

  return { streets, isLoadingStreets };
}
