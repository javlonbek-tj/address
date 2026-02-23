import {
  fetchRegions,
  fetchRegionTableData,
  fetchRegionsList,
} from '@/services';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
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
  const { data, isFetching: isLoadingRegionTableData } =
    useQuery<RegionTableData>({
      queryKey: ['regions-table-data', page, limit, search],
      queryFn: () => fetchRegionTableData(page, limit, search),
      staleTime: Infinity,
      placeholderData: keepPreviousData,
    });

  return { data, isLoadingRegionTableData };
}

export function useRegionsList() {
  const { data: regions = [], isPending: isLoadingRegions } = useQuery<
    Region[]
  >({
    queryKey: ['regions-list'],
    queryFn: () => fetchRegionsList(),
    staleTime: Infinity,
  });

  return { regions, isLoadingRegions };
}
