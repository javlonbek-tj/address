import { useQuery, keepPreviousData } from '@tanstack/react-query';
import type { MahallaTableData, MahallaWithRelations } from '@/types';
import { fetchMahallas, fetchMahallaTableData } from '@/services';

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
  const { data, isFetching: isLoadingMahallaTableData } =
    useQuery<MahallaTableData>({
      queryKey: [
        'mahallas-table-data',
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
