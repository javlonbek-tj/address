import { fetchRegions, fetchRegionTableData } from '@/services';
import { useQuery } from '@tanstack/react-query';
import type { Region } from '@/lib/generated/prisma/client';
import { RegionTableData } from '@/types';

export function useRegions() {
  const { data: regions = [], isPending: isLoadingRegions } = useQuery<
    Region[]
  >({
    queryKey: ['regions'],
    queryFn: () => fetchRegions(),
    staleTime: Infinity,
  });

  return { regions, isLoadingRegions };
}

export function useRegionTableData(
  page: number,
  limit: number,
  search: string,
) {
  const { data, isPending: isLoadingRegionTableData } =
    useQuery<RegionTableData>({
      queryKey: ['regions-table-data', page, limit, search],
      queryFn: () => fetchRegionTableData(page, limit, search),
      staleTime: Infinity,
    });

  return { data, isLoadingRegionTableData };
}
