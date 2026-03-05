'use client';

import dynamic from 'next/dynamic';
import { Spinner } from '@/components/shared';
import type { Geometry } from 'geojson';

const Map = dynamic(() => import('./DetailMap'), {
  ssr: false,
  loading: () => (
    <div className='w-full h-full flex items-center justify-center bg-gray-50 dark:bg-gray-900'>
      <Spinner size='sm' />
    </div>
  ),
});

interface Props {
  geometry: Geometry;
}

export function DetailMapWrapper({ geometry }: Props) {
  return (
    <div className='w-full h-full relative'>
      <Map geometry={geometry} />
    </div>
  );
}
