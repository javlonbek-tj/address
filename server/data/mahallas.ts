import { prisma } from '../prisma';
import type { Mahalla } from '@/types';
import type { MahallaWithRelations } from '@/types';
import type { MahallaWhereInput } from '@/lib/generated/prisma/models';

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
    return [];
  }
}

export async function getMahallaTableData(
  params: {
    page?: number;
    limit?: number;
    search?: string;
    regionId?: string;
    districtId?: string;
    isOptimized?: string;
  } = {},
): Promise<{
  data: Mahalla[];
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
    isOptimized = 'all',
  } = params;
  const skip = (page - 1) * limit;

  try {
    const where: MahallaWhereInput = {
      isActive: true,
    };

    if (districtId !== 'all') {
      where.districtId = districtId;
    } else if (regionId !== 'all') {
      where.district = { regionId };
    }

    if (isOptimized === 'true') {
      where.isOptimized = true;
    } else if (isOptimized === 'false') {
      where.isOptimized = false;
    }

    if (search) {
      const searchTerms: MahallaWhereInput[] = [
        { name: { contains: search, mode: 'insensitive' } },
        { uzKadName: { contains: search, mode: 'insensitive' } },
        { oneId: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
        { geoCode: { contains: search, mode: 'insensitive' } },
      ];

      where.OR = searchTerms;
    }

    const [mahallas, total] = await Promise.all([
      prisma.mahalla.findMany({
        where,
        select: {
          id: true,
          name: true,
          code: true,
          uzKadName: true,
          geoCode: true,
          oneId: true,
          isOptimized: true,
          mergedInto: {
            select: {
              code: true,
              name: true,
            },
          },
          mergedMahallas: {
            select: {
              code: true,
              name: true,
            },
          },
          oldName: true,
          regulation: true,
          regulationUrl: true,
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
        },
        orderBy: { name: 'asc' },
        skip,
        take: limit,
      }),
      prisma.mahalla.count({ where }),
    ]);

    return {
      data: mahallas,
      total,
      page,
      limit,
    };
  } catch (error) {
    return {
      data: [],
      total: 0,
      page,
      limit,
    };
  }
}

export const getMahallaByCode = async (code: string) => {
  try {
    const mahalla = await prisma.mahalla.findUnique({
      where: { code },
      select: {
        id: true,
        uzKadName: true,
      },
    });
    return mahalla;
  } catch (error) {
    return null;
  }
};
export async function getMahallaById(id: string) {
  try {
    const mahalla = await prisma.mahalla.findUnique({
      where: { id },
      include: {
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
        mergedInto: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        mergedMahallas: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        _count: {
          select: {
            streets: true,
            properties: true,
          },
        },
      },
    });

    return mahalla;
  } catch (error) {
    return null;
  }
}
