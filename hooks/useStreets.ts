import type { StreetTableData, StreetWithMetadata } from '@/types';
import {
  fetchStreetListByDistrictId,
  fetchStreetTableData,
  fetchStreetTypes,
  fetchStreets,
} from '@/services';
import { keepPreviousData, useQuery } from '@tanstack/react-query';

export function useStreets(districtId: string) {
  const { data: streets = [], isLoading: isLoadingStreets } = useQuery<
    StreetWithMetadata[]
  >({
    queryKey: ['streets-map', districtId],
    queryFn: () => fetchStreets(districtId),
    enabled: !!districtId,
    staleTime: Infinity,
  });

  return { streets, isLoadingStreets };
}

export function useStreetsByDistrictId(districtId: string) {
  const { data: streets = [], isLoading: isLoadingStreets } = useQuery<
    {
      id: string;
      name: string;
      code: string;
    }[]
  >({
    queryKey: ['streets-list', districtId],
    queryFn: () => fetchStreetListByDistrictId(districtId),
    enabled: !!districtId,
    staleTime: Infinity,
  });

  return { streets, isLoadingStreets };
}

export function useStreetsTableData({
  page,
  limit,
  search,
  regionId,
  districtId,
  mahallaId,
  streetType,
}: {
  page: number;
  limit: number;
  search: string;
  regionId: string;
  districtId: string;
  mahallaId: string;
  streetType: string;
}) {
  const { data, isPending: isLoadingStreetTableData } =
    useQuery<StreetTableData>({
      queryKey: [
        'streets-table',
        page,
        limit,
        search,
        regionId,
        districtId,
        mahallaId,
        streetType,
      ],
      queryFn: () =>
        fetchStreetTableData(
          page,
          limit,
          search,
          regionId,
          districtId,
          mahallaId,
          streetType,
        ),
      staleTime: Infinity,
      placeholderData: keepPreviousData,
    });

  return { data, isLoadingStreetTableData };
}

export function useStreetTypes() {
  const { data: streetTypes = [], isLoading: isLoadingStreetTypes } = useQuery<string[]>({
    queryKey: ['street-types'],
    queryFn: fetchStreetTypes,
    staleTime: Infinity,
  });
  return { streetTypes, isLoadingStreetTypes };
}
