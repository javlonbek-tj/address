import 'server-only';

import { prisma } from '../prisma';
import type { Street as StreetModel } from '@/lib/generated/prisma/client';
import type { Street } from '@/types';

export async function getStreetsByDistrictId(
  districtId: string,
): Promise<StreetModel[]> {
  if (!districtId) return [];

  const streets = await prisma.street.findMany({
    where: {
      districtId,
      isActive: true,
    },
    include: {
      district: {
        select: {
          id: true,
          name: true,
          code: true,
        },
      },
      mahalla: {
        select: {
          id: true,
          name: true,
          code: true,
        },
      },
    },
    orderBy: {
      name: 'asc',
    },
  });

  return streets;
}

export const getStreets = async (): Promise<Street[]> => {
  try {
    const streets = await prisma.street.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        code: true,
        uzKadCode: true,
        type: true,
        oldName: true,
        district: {
          select: {
            name: true,
            region: {
              select: {
                name: true,
              },
            },
          },
        },
        mahalla: {
          select: {
            name: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });
    return streets;
  } catch (error) {
    console.error('Failed to fetch streets:', error);
    return [];
  }
};
