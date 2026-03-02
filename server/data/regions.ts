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

export async function getRegionTableData(
  params: {
    page?: number;
    limit?: number;
    search?: string;
  } = {},
): Promise<{ data: Region[]; total: number; page: number; limit: number }> {
  const { page = 1, limit = 10, search = '' } = params;
  const skip = (page - 1) * limit;

  try {
    const where = {
      isActive: true,
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

    const [regions, total] = await Promise.all([
      prisma.region.findMany({
        where,
        select: {
          id: true,
          name: true,
          code: true,
        },
        orderBy: { name: 'asc' },
        skip,
        take: limit,
      }),
      prisma.region.count({ where }),
    ]);

    return {
      data: regions,
      total,
      page,
      limit,
    };
  } catch (error) {
    console.error('Failed to fetch regions:', error);
    return {
      data: [],
      total: 0,
      page,
      limit,
    };
  }
}
export async function getRegionsList(): Promise<Region[]> {
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
    console.error('Failed to fetch regions list:', error);
    return [];
  }
}
export async function getRegionById(id: string) {
  try {
    const region = await prisma.region.findUnique({
      where: { id },
      include: {
        districts: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!region) return null;

    const districtIds = region.districts.map((d) => d.id);

    const [mahallaCount, streetCount, propertyCount] = await Promise.all([
      prisma.mahalla.count({ where: { districtId: { in: districtIds } } }),
      prisma.street.count({ where: { districtId: { in: districtIds } } }),
      prisma.property.count({ where: { districtId: { in: districtIds } } }),
    ]);

    return {
      ...region,
      stats: {
        districtCount: region.districts.length,
        mahallaCount,
        streetCount,
        propertyCount,
      },
    };
  } catch (error) {
    console.error('Failed to fetch region by ID:', error);
    return null;
  }
}
