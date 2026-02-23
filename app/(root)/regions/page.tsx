import { RegionTable } from '@/components/addressData';
import { Spinner } from '@/components/shared';
import { Suspense } from 'react';

export default async function RegionsPage() {
  return (
    <Suspense fallback={<Spinner />}>
      <RegionTable />
    </Suspense>
  );
}
