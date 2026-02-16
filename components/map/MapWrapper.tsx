'use client';

import { Region } from '@/lib/generated/prisma/client';
import dynamic from 'next/dynamic';

interface MapWrapperProps {
  regions: Region[];
}

const UzbekistanMap = dynamic(() => import('./UzbekistanMap'), {
  ssr: false,
  loading: () => (
    <div className='h-full w-full flex items-center justify-center bg-slate-100'>
      <p>Xarita yuklanmoqda...</p>
    </div>
  ),
});

export function MapWrapper({ regions }: MapWrapperProps) {
  return <UzbekistanMap regions={regions} />;
}
