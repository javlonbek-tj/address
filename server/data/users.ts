import { prisma } from '@/server/prisma';
import { UserRole, UserStatus } from '@/lib/generated/prisma/enums';

export async function getUserTableData(
  params: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    status?: string;
    regionId?: string;
    districtId?: string;
  } = {},
) {
  const {
    page = 1,
    limit = 10,
    search = '',
    role = 'all',
    status = 'all',
    regionId = 'all',
    districtId = 'all',
  } = params;
  const skip = (page - 1) * limit;

  try {
    const where: any = {
      isActive: true,
    };

    if (role !== 'all') {
      where.role = role as UserRole;
    }

    if (status !== 'all') {
      where.status = status as UserStatus;
    }

    if (districtId !== 'all') {
      where.districtId = districtId;
    } else if (regionId !== 'all') {
      where.OR = [{ regionId: regionId }, { district: { regionId: regionId } }];
    }

    if (search) {
      const searchFilter = {
        OR: [
          { fullName: { contains: search, mode: 'insensitive' } },
          { phoneNumber: { contains: search, mode: 'insensitive' } },
        ],
      };

      if (where.OR) {
        // If we already have an OR (from regionId), we need to AND them
        const previousOR = where.OR;
        delete where.OR;
        where.AND = [{ OR: previousOR }, searchFilter];
      } else {
        where.OR = searchFilter.OR;
      }
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        include: {
          region: {
            select: { id: true, name: true },
          },
          district: {
            select: { id: true, name: true },
          },
        },
        orderBy: { updatedAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);

    return {
      data: users,
      total,
      page,
      limit,
    };
  } catch (error) {
    console.error('Failed to fetch user table data:', error);
    return {
      data: [],
      total: 0,
      page,
      limit,
    };
  }
}

export async function getUserById(id: string) {
  try {
    return await prisma.user.findUnique({
      where: { id },
      include: {
        region: true,
        district: true,
      },
    });
  } catch (error) {
    console.error('Failed to fetch user by ID:', error);
    return null;
  }
}
