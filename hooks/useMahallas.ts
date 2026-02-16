import { fetchMahallas } from '@/services';
import { useQuery } from '@tanstack/react-query';
import { Mahalla } from '@/types';

export function useMahallas(districtId: string) {
  const { data: mahallas = [], isLoading: isLoadingMahallas } = useQuery<
    Mahalla[]
  >({
    queryKey: ['mahallas', districtId],
    queryFn: () => fetchMahallas(districtId),
    enabled: !!districtId,
    staleTime: Infinity,
  });

  return { mahallas, isLoadingMahallas };
}
