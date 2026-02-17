import 'server-only';

import { prisma } from '../prisma';
import type { Street } from '@/types';

export async function getStreets(districtId: string): Promise<Street[]> {
  if (!districtId) return [];

  const streets = await prisma.street.findMany({
    where: {
      districtId,
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
