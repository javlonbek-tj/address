import 'server-only';

import { prisma } from '../prisma';
import type { Region as RegionModel } from '@/lib/generated/prisma/client';
import type { Region } from '@/types';

export async function getRegions(): Promise<RegionModel[]> {
  try {
    const regions = await prisma.region.findMany({
      where: {
        isActive: true,
      },
      orderBy: { name: 'asc' },
    });

    return regions;
  } catch (error) {
    console.error('Failed to fetch regions:', error);
    return [];
  }
}

export async function getRegionTableData(): Promise<Region[]> {
  try {
    const regions = await prisma.region.findMany({
      where: {
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        code: true,
      },
      orderBy: { name: 'asc' },
    });

    return regions;
  } catch (error) {
    console.error('Failed to fetch regions:', error);
    return [];
  }
}
