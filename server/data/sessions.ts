import { prisma } from '@/server/prisma';

export async function getSessionsTableData(
  params: { page?: number; limit?: number } = {},
) {
  const { page = 1, limit = 10 } = params;
  const skip = (page - 1) * limit;

  try {
    const [sessions, total] = await Promise.all([
      prisma.session.findMany({
        include: {
          user: {
            select: {
              username: true,
              appUser: { select: { fullName: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.session.count(),
    ]);

    return { data: sessions, total, page, limit };
  } catch {
    return { data: [], total: 0, page, limit };
  }
}
