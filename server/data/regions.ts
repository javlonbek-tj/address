import 'server-only';

import { prisma } from '../prisma';
import type { Region as RegionModel } from '@/lib/generated/prisma/client';

export async function getRegions(): Promise<RegionModel[]> {
  try {
    const regions = await prisma.region.findMany({
      orderBy: { name: 'asc' },
    });

    return regions;
  } catch (error) {
    console.error('Failed to fetch regions:', error);
    return [];
  }
}
