import 'server-only';

import { prisma } from '../prisma';
import type { Region } from '@/types';

export async function getRegions(): Promise<Region[]> {
  try {
    const regions = await prisma.region.findMany({
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
