import { prisma } from '../prisma';
import type { District as DistrictModel } from '@/lib/generated/prisma/client';
import type { District } from '@/types';

export async function getDistrictsByRegionId(
  regionId: string,
): Promise<DistrictModel[]> {
  if (!regionId) return [];
  try {
    const districts = await prisma.district.findMany({
      where: { regionId, isActive: true },
      orderBy: { name: 'asc' },
    });

    return districts;
  } catch (error) {
    return [];
  }
}

export async function getDistrictTableData(
  params: {
    page?: number;
    limit?: number;
    search?: string;
    regionId?: string;
  } = {},
): Promise<{
  data: District[];
  total: number;
  page: number;
  limit: number;
}> {
  const { page = 1, limit = 10, search = '', regionId = 'all' } = params;
  const skip = (page - 1) * limit;

  try {
    const where = {
      isActive: true,
      ...(regionId !== 'all' ? { regionId } : {}),
      ...(search
        ? {
            OR: [
              {
                name: {
                  contains: search,
                  mode: 'insensitive' as const,
                },
              },
              {
                code: {
                  contains: search,
                  mode: 'insensitive' as const,
                },
              },
            ],
          }
        : {}),
    };

    const [districts, total] = await Promise.all([
      prisma.district.findMany({
        where,
        select: {
          id: true,
          name: true,
          code: true,
          regionId: true,
        },
        orderBy: { name: 'asc' },
        skip,
        take: limit,
      }),
      prisma.district.count({ where }),
    ]);

    return {
      data: districts,
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
export async function getDistrictsList(regionId: string): Promise<District[]> {
  try {
    const where = {
      isActive: true,
      ...(regionId !== 'all' && { regionId }),
    };

    const districts = await prisma.district.findMany({
      where,
      select: {
        id: true,
        name: true,
        code: true,
        regionId: true,
      },
      orderBy: { name: 'asc' },
    });

    return districts;
  } catch (error) {
    return [];
  }
}
export async function getDistrictById(id: string) {
  try {
    const district = await prisma.district.findUnique({
      where: { id },
      include: {
        region: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!district) return null;

    const [mahallaCount, streetCount, propertyCount] = await Promise.all([
      prisma.mahalla.count({ where: { districtId: id } }),
      prisma.street.count({ where: { districtId: id } }),
      prisma.property.count({ where: { districtId: id } }),
    ]);

    return {
      ...district,
      stats: {
        mahallaCount,
        streetCount,
        propertyCount,
      },
    };
  } catch (error) {
    return null;
  }
}
