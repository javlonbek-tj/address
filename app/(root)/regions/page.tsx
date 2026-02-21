import { RegionTable } from '@/components/addressData';
import { ErrorMessage } from '@/components/shared';
import { getRegionTableData } from '@/server';

export const dynamic = 'force-dynamic';

export default async function AddressDataPage() {
  const regions = await getRegionTableData();

  if (!regions) {
    return <ErrorMessage className='min-h-[calc(100vh-4rem)]' />;
  }

  return <RegionTable regions={regions} />;
}
