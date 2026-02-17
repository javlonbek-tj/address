import type { Mahalla } from '@/types';
import { fetchMahallas } from '@/services';
import { useQuery } from '@tanstack/react-query';

export function useMahallas(districtId: string) {
  const { data: mahallas = [], isLoading: isLoadingMahallas } = useQuery<
    Mahalla[]
  >({
    queryKey: ['mahallas', districtId],
    queryFn: () => fetchMahallas(districtId),
    enabled: !!districtId,
  });

  return { mahallas, isLoadingMahallas };
}
