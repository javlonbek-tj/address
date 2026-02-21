import { DistrictTable } from '@/components/addressData';
import { ErrorMessage } from '@/components/shared';
import { getDistrictTableData, getRegionTableData } from '@/server';

export const dynamic = 'force-dynamic';

export default async function DistrictsPage() {
  const [districts, regions] = await Promise.all([
    getDistrictTableData(),
    getRegionTableData(),
  ]);

  if (!districts) {
    return <ErrorMessage className='min-h-[calc(100vh-4rem)]' />;
  }

  return <DistrictTable districts={districts} regions={regions} />;
}
