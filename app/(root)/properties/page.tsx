import { PropertyTable } from '@/components/addressData/property';
import { Spinner } from '@/components/shared';
import { Suspense } from 'react';

export default async function PropertiesPage() {
  return (
    <Suspense fallback={<Spinner />}>
      <PropertyTable />
    </Suspense>
  );
}
