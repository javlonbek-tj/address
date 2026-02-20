import 'server-only';

import { prisma } from '../prisma';
import type { District as DistrictModel } from '@/lib/generated/prisma/client';
import type { District } from '@/types';

export async function getDistrictsByRegionId(
  regionId: string,
): Promise<DistrictModel[]> {
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
export async function getDistricts(): Promise<District[]> {
  try {
    const districts = await prisma.district.findMany({
      select: {
        id: true,
        name: true,
        code: true,
      },
      orderBy: { name: 'asc' },
    });
    return districts;
  } catch (error) {
    console.error('Failed to fetch districts:', error);
    return [];
  }
}
