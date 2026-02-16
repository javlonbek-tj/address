import 'server-only';

import { prisma } from '../prisma';
import type { Region } from '@/lib/generated/prisma/client';

export async function getRegions(): Promise<Region[]> {
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
