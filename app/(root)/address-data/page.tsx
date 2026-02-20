import { AddressDataTable } from '@/components/addressData';
import { ErrorMessage } from '@/components/shared';
import { getDistricts, getMahallas, getRegions, getStreets } from '@/server';

export const dynamic = 'force-dynamic';

export default async function AddressDataPage() {
  const regions = await getRegions();
  const districts = await getDistricts();
  const mahallas = await getMahallas();
  const streets = await getStreets();

  if (!regions) {
    return <ErrorMessage className='min-h-[calc(100vh-4rem)]' />;
  }

  return (
    <AddressDataTable
      regions={regions}
      districts={districts}
      mahallas={mahallas}
      streets={streets}
    />
  );
}
