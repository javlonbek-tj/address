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

export async function getMahallaTableData(
  params: {
    page?: number;
    limit?: number;
    search?: string;
    regionId?: string;
    districtId?: string;
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
  } = params;
  const skip = (page - 1) * limit;

  try {
    const where: any = {
      isActive: true,
    };

    if (districtId !== 'all') {
      where.districtId = districtId;
    } else if (regionId !== 'all') {
      where.district = { regionId };
    }

    if (search) {
      const searchTerms = [];
      searchTerms.push({ name: { contains: search, mode: 'insensitive' } });
      searchTerms.push({
        uzKadName: { contains: search, mode: 'insensitive' },
      });
      searchTerms.push({ oneId: { contains: search, mode: 'insensitive' } });

      const numSearch = Number(search);
      if (!isNaN(numSearch)) {
        searchTerms.push({ code: numSearch });
        searchTerms.push({ geoCode: numSearch });
      }

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
          hidden: true,
          mergedIntoName: true,
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
    console.error('Failed to fetch mahalla table data:', error);
    return {
      data: [],
      total: 0,
      page,
      limit,
    };
  }
}
