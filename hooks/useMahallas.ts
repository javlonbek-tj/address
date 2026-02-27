import { useQuery, keepPreviousData } from '@tanstack/react-query';
import type { MahallaTableData, MahallaWithRelations } from '@/types';
import { fetchMahallas, fetchMahallaTableData } from '@/services';
import { fetchMahallasList } from '@/services/mahallas';

export function useMahallas(districtId: string) {
  const { data: mahallas = [], isLoading: isLoadingMahallas } = useQuery<
    MahallaWithRelations[]
  >({
    queryKey: ['mahallas-map', districtId],
    queryFn: () => fetchMahallas(districtId),
    enabled: !!districtId,
    staleTime: Infinity,
  });

  return { mahallas, isLoadingMahallas };
}

export function useMahallasTableData({
  page,
  limit,
  search,
  regionId,
  districtId,
  isOptimized,
}: {
  page: number;
  limit: number;
  search: string;
  regionId: string;
  districtId: string;
  isOptimized: string;
}) {
  const { data, isPending: isLoadingMahallaTableData } =
    useQuery<MahallaTableData>({
      queryKey: [
        'mahallas-table',
        page,
        limit,
        search,
        regionId,
        districtId,
        isOptimized,
      ],
      queryFn: () =>
        fetchMahallaTableData(
          page,
          limit,
          search,
          regionId,
          districtId,
          isOptimized,
        ),
      staleTime: Infinity,
      placeholderData: keepPreviousData,
    });

  return { data, isLoadingMahallaTableData };
}

export function useMahallasList(districtId?: string) {
  const { data: mahallas = [], isLoading: isLoadingMahallas } = useQuery<
    { id: string; name: string; code: string }[]
  >({
    queryKey: ['mahallas-list', districtId],
    queryFn: () => fetchMahallasList(districtId),
    enabled: !!districtId && districtId !== 'all',
    staleTime: Infinity,
  });

  return { mahallas, isLoadingMahallas };
}
