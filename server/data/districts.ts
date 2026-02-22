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
      where: { regionId, isActive: true },
      orderBy: { name: 'asc' },
    });

    return districts;
  } catch (error) {
    console.error('Failed to fetch districts:', error);
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
            name: {
              contains: search,
              mode: 'insensitive' as const,
            },
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
    console.error('Failed to fetch districts:', error);
    return {
      data: [],
      total: 0,
      page,
      limit,
    };
  }
}
