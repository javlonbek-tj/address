import { StreetTable } from '@/components/addressData';
import { Spinner } from '@/components/shared';
import { Suspense } from 'react';

export default async function StreetsPage() {
  return (
    <Suspense fallback={<Spinner />}>
      <StreetTable />
    </Suspense>
  );
}
