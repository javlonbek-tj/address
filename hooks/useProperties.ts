import type { PropertyDetail, PropertyListItem } from '@/types';
import { fetchProperties, fetchPropertyById } from '@/services';
import { useQuery } from '@tanstack/react-query';

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

export function usePropertyById(id: string | null) {
  const { data: property = null, isLoading: isLoadingProperty } = useQuery<PropertyDetail | null>({
    queryKey: ['property', id],
    queryFn: () => fetchPropertyById(id as string),
    enabled: !!id,
  });

  return { property, isLoadingProperty };
}
