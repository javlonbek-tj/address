import 'server-only';

import { prisma } from '../prisma';
import { Mahalla } from '@/types';

export async function getMahallas(districtId: string): Promise<Mahalla[]> {
  if (!districtId) return [];
  try {
    const mahallas = await prisma.mahalla.findMany({
      where: { districtId },
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
