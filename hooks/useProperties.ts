import type { PropertyDetail, PropertyListItem, StreetNumbers } from '@/types';
import { fetchProperties, fetchPropertyById, fetchStreetNumbers } from '@/services';
import { useQuery } from '@tanstack/react-query';

const EMPTY_STREET_NUMBERS: StreetNumbers = { used: [], reserved: [] };

// After a house-number write, invalidate ['properties', districtId] (covers every mahalla
// variant by prefix) and ['property', id] for each written property.
export function useProperties(districtId: string, mahallaId?: string) {
  const {
    data: properties = [],
    isLoading: isLoadingProperties,
    dataUpdatedAt,
  } = useQuery<PropertyListItem[]>({
    queryKey: ['properties', districtId, mahallaId ?? ''],
    queryFn: () => fetchProperties(districtId, mahallaId),
    enabled: !!districtId,
    staleTime: Infinity,
  });

  return { properties, isLoadingProperties, dataUpdatedAt };
}

// Used and reserved numbers of a street; invalidate ['street-numbers', streetId] after writes.
export function useStreetNumbers(streetId: string) {
  const { data = EMPTY_STREET_NUMBERS, isLoading: isLoadingStreetNumbers } = useQuery<StreetNumbers>({
    queryKey: ['street-numbers', streetId],
    queryFn: () => fetchStreetNumbers(streetId),
    enabled: !!streetId,
  });

  return { streetNumbers: data, isLoadingStreetNumbers };
}

export function usePropertyById(id: string | null) {
  const { data: property = null, isLoading: isLoadingProperty } = useQuery<PropertyDetail | null>({
    queryKey: ['property', id],
    queryFn: () => fetchPropertyById(id as string),
    enabled: !!id,
  });

  return { property, isLoadingProperty };
}
