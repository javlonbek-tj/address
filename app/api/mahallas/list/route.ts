import { NextRequest } from 'next/server';
import { prisma } from '@/server';

export async function GET(request: NextRequest) {
  try {
    const districtId = request.nextUrl.searchParams.get('districtId');

    const where: any = { isActive: true };
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
    const message = error instanceof Error ? error.message : 'Unknown error';
    return Response.json({ success: false, error: message }, { status: 500 });
  }
}
