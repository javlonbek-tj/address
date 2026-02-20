import type { Mahalla as MahallaModel } from '@/lib/generated/prisma/client';
import { fetchMahallas } from '@/services';
import { useQuery } from '@tanstack/react-query';

export function useMahallas(districtId: string) {
  const { data: mahallas = [], isLoading: isLoadingMahallas } = useQuery<
    MahallaModel[]
  >({
    queryKey: ['mahallas', districtId],
    queryFn: () => fetchMahallas(districtId),
    enabled: !!districtId,
  });

  return { mahallas, isLoadingMahallas };
}
