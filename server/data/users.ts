import { prisma } from '@/server/prisma';
import type { UserRole, UserStatus } from '@/lib/generated/prisma/enums';
import type { UserWhereInput } from '@/lib/generated/prisma/models';

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
    // 1. Start with a typed array of conditions
    const conditions: UserWhereInput[] = [
      { isActive: true }, // Your base filter
    ];

    // 2. Push simple filters
    if (role !== 'all') {
      conditions.push({ role: role as UserRole });
    }

    if (status !== 'all') {
      conditions.push({ status: status as UserStatus });
    }

    // 3. Push location filters
    if (districtId !== 'all') {
      conditions.push({ districtId });
    } else if (regionId !== 'all') {
      conditions.push({
        OR: [{ regionId: regionId }, { district: { regionId: regionId } }],
      });
    }

    // 4. Push search filters
    if (search) {
      conditions.push({
        OR: [
          { fullName: { contains: search, mode: 'insensitive' } },
          { phoneNumber: { contains: search, mode: 'insensitive' } },
        ],
      });
    }

    // 5. Finally, combine everything into a single 'where' object
    const where: UserWhereInput = {
      AND: conditions,
    };

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
        orderBy: { status: 'asc' },
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
