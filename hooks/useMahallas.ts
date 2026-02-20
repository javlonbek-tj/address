import type { MahallaWithRelations } from '@/types';
import { fetchMahallas } from '@/services';
import { useQuery } from '@tanstack/react-query';

export function useMahallas(districtId: string) {
  const { data: mahallas = [], isLoading: isLoadingMahallas } = useQuery<
    MahallaWithRelations[]
  >({
    queryKey: ['mahallas', districtId],
    queryFn: () => fetchMahallas(districtId),
    enabled: !!districtId,
  });

  return { mahallas, isLoadingMahallas };
}
