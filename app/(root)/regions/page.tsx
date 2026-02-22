import { RegionTable } from '@/components/addressData';
import { ErrorMessage } from '@/components/shared';
import { getRegionTableData } from '@/server';

export default async function RegionsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string; limit?: string }>;
}) {
  const { page = '1', search = '', limit = '10' } = await searchParams;

  const result = await getRegionTableData({
    page: Number(page),
    limit: Number(limit),
    search: search,
  });

  const totalPages = Math.ceil(result.total / result.limit);

  if (!result || !result.data) {
    return <ErrorMessage className="min-h-[calc(100vh-4rem)]" />;
  }

  return (
    <RegionTable
      regions={result.data}
      totalCount={result.total}
      currentPage={result.page}
      pageSize={result.limit}
      search={search}
      totalPages={totalPages}
    />
  );
}
