import type { PropertyWhereInput } from '@/lib/generated/prisma/models';
import { prisma } from '@/server/prisma';
import type { Property, PropertyTableData } from '@/types';

export async function getPropertiesByMahallaCode(mahallaCode: string) {
  return await prisma.property.findMany({
    where: {
      mahallaId: mahallaCode,
      isActive: true,
    },
    select: {
      id: true,
      cadNumber: true,
      newCadNumber: true,
      type: true,
      geometry: true,
      center: true,
      streetId: true,
      districtId: true,
      mahallaId: true,
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
    },
  });
}

export async function getPropertyById(id: string): Promise<Property | null> {
  return await prisma.property.findUnique({
    where: {
      id,
    },
    select: {
      id: true,
      cadNumber: true,
      newCadNumber: true,
      newHouseNumber: true,
      isNew: true,
      mahalla: {
        select: {
          id: true,
          name: true,
          code: true,
        },
      },
      type: true,
      street: {
        select: {
          id: true,
          name: true,
          code: true,
        },
      },
      district: {
        select: {
          id: true,
          name: true,
          code: true,
          region: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
        },
      },
    },
  });
}

export async function getPropertyTableData(
  params: {
    page?: number;
    limit?: number;
    search?: string;
    regionId?: string;
    districtId?: string;
    mahallaId?: string;
    streetId?: string;
    isNew?: string;
  } = {},
) {
  const {
    page = 1,
    limit = 10,
    search = '',
    regionId = 'all',
    districtId = 'all',
    mahallaId = 'all',
    streetId = 'all',
    isNew = 'all',
  } = params;
  const skip = (page - 1) * limit;

  try {
    const where: PropertyWhereInput = {
      isActive: true,
      newCadNumber: { not: null, notIn: [''] },
    };

    if (streetId !== 'all') {
      where.streetId = streetId;
    } else if (mahallaId !== 'all') {
      where.mahallaId = mahallaId;
    } else if (districtId !== 'all') {
      where.districtId = districtId;
    } else if (regionId !== 'all') {
      where.district = { regionId };
    }

    if (isNew !== 'all' && isNew) {
      where.isNew = isNew === 'true';
    }

    if (search) {
      where.OR = [
        { cadNumber: { contains: search, mode: 'insensitive' } },
        { newCadNumber: { contains: search, mode: 'insensitive' } },
        { newHouseNumber: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [properties, total] = await Promise.all([
      prisma.property.findMany({
        where,
        select: {
          id: true,
          cadNumber: true,
          newCadNumber: true,
          newHouseNumber: true,
          type: true,
          isNew: true,
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
              code: true,
            },
          },
          street: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
        },
        orderBy: { updatedAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.property.count({ where }),
    ]);

    return {
      data: properties,
      total,
      page,
      limit,
    };
  } catch (error) {
    console.error('Failed to fetch property table data:', error);
    return {
      data: [],
      total: 0,
      page,
      limit,
    };
  }
}

export async function getPropertyDetailById(id: string) {
  try {
    const property = await prisma.property.findUnique({
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
        mahalla: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        street: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    });

    return property;
  } catch (error) {
    console.error('Failed to fetch property by ID:', error);
    return null;
  }
}
