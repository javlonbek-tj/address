'use client';

import dynamic from 'next/dynamic';
import { useRegions } from '@/hooks/useRegions';
import { ErrorMessage, Spinner } from '@/components/shared';

const UzbekistanMap = dynamic(() => import('@/components/map/UzbekistanMap'), {
  ssr: false,
  loading: () => <Spinner />,
});

export default function HomePage() {
  const { regions, isLoadingRegions } = useRegions();

  if (isLoadingRegions) {
    return <Spinner />;
  }

  if (!regions || regions.length === 0) {
    return <ErrorMessage className="min-h-[calc(100vh-4rem)]" />;
  }

  return <UzbekistanMap regions={regions} />;
}
