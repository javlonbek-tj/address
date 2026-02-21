import 'server-only';

import { prisma } from '../prisma';
import type { Mahalla } from '@/types';
import type { MahallaWithRelations } from '@/types';

export async function getMahallasByDistrictId(
  districtId: string,
): Promise<MahallaWithRelations[]> {
  if (!districtId) return [];
  try {
    const mahallas = await prisma.mahalla.findMany({
      where: { districtId, isActive: true },
      include: {
        district: {
          select: {
            id: true,
            code: true,
            name: true,
            region: {
              select: {
                id: true,
                name: true,
                code: true,
              },
            },
          },
        },
        _count: {
          select: { streets: true },
        },
      },
      orderBy: { name: 'asc' },
    });
    return mahallas;
  } catch (error) {
    console.error('Failed to fetch mahallas:', error);
    return [];
  }
}

export const getMahallas = async (): Promise<Mahalla[]> => {
  try {
    const mahallas = await prisma.mahalla.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        code: true,
        uzKadName: true,
        geoCode: true,
        oneId: true,
        hidden: true,
        mergedIntoName: true,
        district: {
          select: {
            name: true,
            region: { select: { name: true } },
          },
        },
      },
      orderBy: { name: 'asc' },
    });
    return mahallas;
  } catch (error) {
    console.error('Failed to fetch mahallas:', error);
    return [];
  }
};
