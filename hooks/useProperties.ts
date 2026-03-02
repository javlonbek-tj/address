import type {
  PropertyForForm,
  PropertyTableData,
  PropertyWithRelations,
} from '@/types';
import {
  fetchProperties,
  fetchPropertyById,
  fetchPropertyTableData,
} from '@/services';
import { keepPreviousData, useQuery } from '@tanstack/react-query';

export function useProperties(mahallaCode: string | null) {
  const { data: properties = [], isLoading: isLoadingProperties } = useQuery<
    PropertyWithRelations[]
  >({
    queryKey: ['properties-map', mahallaCode],
    queryFn: () => (mahallaCode ? fetchProperties(mahallaCode) : []),
    enabled: !!mahallaCode,
  });

  return { properties, isLoadingProperties };
}

export function useProperty(propertyId: string) {
  const { data: property = null, isLoading: isLoadingProperty } =
    useQuery<PropertyForForm | null>({
      queryKey: ['property', propertyId],
      queryFn: () => fetchPropertyById(propertyId),
      enabled: !!propertyId,
    });

  return { property, isLoadingProperty };
}

export function usePropertiesTableData({
  page,
  limit,
  search,
  regionId,
  districtId,
  mahallaId,
  streetId,
}: {
  page: number;
  limit: number;
  search: string;
  regionId: string;
  districtId: string;
  mahallaId: string;
  streetId: string;
}) {
  const { data, isPending: isLoadingPropertyTableData } =
    useQuery<PropertyTableData>({
      queryKey: [
        'properties-table',
        page,
        limit,
        search,
        regionId,
        districtId,
        mahallaId,
        streetId,
      ],
      queryFn: () =>
        fetchPropertyTableData(
          page,
          limit,
          search,
          regionId,
          districtId,
          mahallaId,
          streetId,
        ),
      staleTime: Infinity,
      placeholderData: keepPreviousData,
    });

  return { data, isLoadingPropertyTableData };
}
