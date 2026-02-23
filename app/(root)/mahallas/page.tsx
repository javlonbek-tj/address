import { MahallaTable } from '@/components/addressData';
import { Spinner } from '@/components/shared';
import { Suspense } from 'react';

export default async function MahallasPage() {
  return (
    <Suspense fallback={<Spinner />}>
      <MahallaTable />
    </Suspense>
  );
}
