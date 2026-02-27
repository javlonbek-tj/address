import { fetchDistricts, fetchDistrictsList } from '@/services';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import type { District } from '@/lib/generated/prisma/client';
import { DistrictTableData } from '@/types';
import { fetchDistrictTableData } from '@/services';

export function useDistricts(regionId: string) {
  const { data: districts = [], isLoading: isLoadingDistricts } = useQuery<
    District[]
  >({
    queryKey: ['districts-map', regionId],
    queryFn: () => fetchDistricts(regionId),
    enabled: !!regionId,
    staleTime: Infinity,
  });

  return { districts, isLoadingDistricts };
}

export function useDistrictTableData(
  page: number,
  limit: number,
  search: string,
  regionId: string,
) {
  const { data, isPending: isLoadingDistrictTableData } =
    useQuery<DistrictTableData>({
      queryKey: ['districts-table', page, limit, search, regionId],
      queryFn: () => fetchDistrictTableData(page, limit, search, regionId),
      staleTime: Infinity,
      placeholderData: keepPreviousData,
    });

  return { data, isLoadingDistrictTableData };
}

export function useDistrictsList(regionId: string) {
  const { data: districts = [], isLoading: isLoadingDistricts } = useQuery<
    District[]
  >({
    queryKey: ['districts-list', regionId],
    queryFn: () => fetchDistrictsList(regionId),
    enabled: !!regionId && regionId !== 'all',
    staleTime: Infinity,
  });

  return { districts, isLoadingDistricts };
}
