import { MahallaTable } from '@/components/addressData';
import { ErrorMessage } from '@/components/shared';
import {
  getMahallaTableData,
  getRegionTableData,
  getDistrictsByRegionId,
} from '@/server';

export const dynamic = 'force-dynamic';

export default async function MahallasPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string;
    search?: string;
    limit?: string;
    regionId?: string;
    districtId?: string;
  }>;
}) {
  const {
    page = '1',
    search = '',
    limit = '10',
    regionId = 'all',
    districtId = 'all',
  } = await searchParams;

  const [result, regions, districts] = await Promise.all([
    getMahallaTableData({
      page: Number(page),
      limit: Number(limit),
      search,
      regionId,
      districtId,
    }),
    getRegionTableData(),
    regionId !== 'all' ? getDistrictsByRegionId(regionId) : Promise.resolve([]),
  ]);

  if (!result || !result.data) {
    return <ErrorMessage className="min-h-[calc(100vh-4rem)]" />;
  }

  const totalPages = Math.ceil(result.total / result.limit);

  return (
    <MahallaTable
      mahallas={result.data}
      regions={Array.isArray(regions) ? regions : (regions as any).data}
      initialDistricts={districts as any}
      totalCount={result.total}
      currentPage={result.page}
      pageSize={result.limit}
      totalPages={totalPages}
      search={search}
      regionId={regionId}
      districtId={districtId}
    />
  );
}
