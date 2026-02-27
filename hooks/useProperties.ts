import { useQuery } from '@tanstack/react-query';
import { PropertyForForm, PropertyWithRelations } from '@/types';
import { fetchProperties, fetchPropertyById } from '@/services';

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
