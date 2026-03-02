import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { getUsers, UserParams } from '@/services';

export function useUsersTableData(params: UserParams) {
  return useQuery({
    queryKey: ['users-table', params],
    queryFn: () => getUsers(params),
    placeholderData: keepPreviousData,
  });
}
