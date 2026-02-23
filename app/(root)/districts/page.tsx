import { DistrictTable } from '@/components/addressData';
import { Spinner } from '@/components/shared';
import { Suspense } from 'react';

export default async function DistrictsPage() {
  return (
    <Suspense fallback={<Spinner />}>
      <DistrictTable />
    </Suspense>
  );
}
