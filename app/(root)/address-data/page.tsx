import { AddressDataTable } from '@/components/addressData';
import { ErrorMessage } from '@/components/shared';
import { getRegions } from '@/server';

export const dynamic = 'force-dynamic';

export default async function AddressDataPage() {
  const regions = await getRegions();

  if (!regions) {
    return <ErrorMessage className='min-h-[calc(100vh-4rem)]' />;
  }

  return <AddressDataTable regions={regions} />;
}
