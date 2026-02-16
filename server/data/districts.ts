import 'server-only';

import { prisma } from '../prisma';
import type { District } from '@/lib/generated/prisma/client';

export async function getDistricts(regionId: string): Promise<District[]> {
  if (!regionId) return [];
  try {
    const districts = await prisma.district.findMany({
      where: { regionId },
      orderBy: { name: 'asc' },
    });
    return districts;
  } catch (error) {
    console.error('Failed to fetch districts:', error);
    return [];
  }
}
