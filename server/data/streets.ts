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

export const getStreetListByDistrictId = async (districtId: string) => {
  try {
    const streets = await prisma.street.findMany({
      where: { districtId, isActive: true },
      select: {
        id: true,
        name: true,
        code: true,
      },
      orderBy: { name: 'asc' },
    });
    return streets;
  } catch (error) {
    console.error('Failed to fetch streets:', error);
    return [];
  }
};

export async function getStreetTableData(
  params: {
    page?: number;
    limit?: number;
    search?: string;
    regionId?: string;
    districtId?: string;
    mahallaId?: string;
  } = {},
): Promise<{
  data: Street[];
  total: number;
  page: number;
  limit: number;
}> {
  const {
    page = 1,
    limit = 10,
    search = '',
    regionId = 'all',
    districtId = 'all',
    mahallaId = 'all',
  } = params;
  const skip = (page - 1) * limit;

  try {
    const where: any = {
      isActive: true,
    };

    if (mahallaId !== 'all') {
      where.mahallaId = mahallaId;
    } else if (districtId !== 'all') {
      where.districtId = districtId;
    } else if (regionId !== 'all') {
      where.district = { regionId };
    }

    if (search) {
      const searchTerms = [];
      searchTerms.push({ name: { contains: search, mode: 'insensitive' } });
      searchTerms.push({ code: { contains: search, mode: 'insensitive' } });
      searchTerms.push({
        uzKadCode: { contains: search, mode: 'insensitive' },
      });
      where.OR = searchTerms;
    }

    const [streets, total] = await Promise.all([
      prisma.street.findMany({
        where,
        select: {
          id: true,
          name: true,
          code: true,
          uzKadCode: true,
          type: true,
          oldName: true,
          district: {
            select: {
              id: true,
              name: true,
              region: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
          mahalla: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { name: 'asc' },
        skip,
        take: limit,
      }),
      prisma.street.count({ where }),
    ]);

    return {
      data: streets as unknown as Street[],
      total,
      page,
      limit,
    };
  } catch (error) {
    console.error('Failed to fetch street table data:', error);
    return {
      data: [],
      total: 0,
      page,
      limit,
    };
  }
}
