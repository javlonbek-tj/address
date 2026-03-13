import { NextRequest } from 'next/server';
import { prisma } from '@/server';
import type { MahallaWhereInput } from '@/lib/generated/prisma/models';

export async function GET(request: NextRequest) {
  try {
    const districtId = request.nextUrl.searchParams.get('districtId');

    const where: MahallaWhereInput = {
      isActive: true,
    };
    if (districtId) {
      where.districtId = districtId;
    }

    const mahallas = await prisma.mahalla.findMany({
      where,
      select: {
        id: true,
        name: true,
        code: true,
      },
      orderBy: { name: 'asc' },
    });

    return Response.json({ success: true, data: mahallas });
  } catch (error) {
    return Response.json({ success: false, error: 'INTERNAL_SERVER_ERROR' }, { status: 500 });
  }
}
