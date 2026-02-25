import { useQuery } from '@tanstack/react-query';
import { PropertyWithRelations } from '@/types';
import { fetchProperties } from '@/services';

export function useProperties(mahallaCode: string | null) {
  const { data: properties = [], isLoading: isLoadingProperties } = useQuery<
    PropertyWithRelations[]
  >({
    queryKey: ['properties', mahallaCode],
    queryFn: () => fetchProperties(mahallaCode!),
    enabled: !!mahallaCode,
  });

  return { properties, isLoadingProperties };
}
