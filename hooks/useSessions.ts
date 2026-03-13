import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { getSessions, SessionParams } from '@/services';

export function useSessionsTableData(params: SessionParams) {
  return useQuery({
    queryKey: ['sessions-table', params],
    queryFn: () => getSessions(params),
    placeholderData: keepPreviousData,
  });
}
