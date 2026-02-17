'use client';

import type { Region } from '@/lib/generated/prisma/client';
import dynamic from 'next/dynamic';
import { Spinner } from '../shared';

interface Props {
  regions: Region[];
}

const UzbekistanMap = dynamic(() => import('./UzbekistanMap'), {
  ssr: false,
  loading: () => <Spinner />,
});

export function MapWrapper({ regions }: Props) {
  return <UzbekistanMap regions={regions} />;
}
