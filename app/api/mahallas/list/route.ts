import { NextRequest } from 'next/server';
import { prisma } from '@/server';
import type { MahallaWhereInput } from '@/lib/generated/prisma/models';
import { getServerSession } from '@/lib/auth/session';
import { UserRole } from '@/lib/generated/prisma/enums';

export async function GET(request: NextRequest) {
  const session = await getServerSession();
  if (!session) {
    return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { user } = session;
    const where: MahallaWhereInput = { isActive: true };

    if (user.role === UserRole.district_user) {
      where.districtId = user.districtId ?? undefined;
    } else if (user.role === UserRole.region_user) {
      const districtId = request.nextUrl.searchParams.get('districtId');
      if (districtId) {
        where.districtId = districtId;
      } else {
        where.district = { regionId: user.regionId ?? undefined };
      }
    } else {
      const districtId = request.nextUrl.searchParams.get('districtId');
      if (districtId) {
        where.districtId = districtId;
      }
    }

    const mahallas = await prisma.mahalla.findMany({
      where,
      select: { id: true, name: true, code: true },
      orderBy: { name: 'asc' },
    });

    return Response.json({ success: true, data: mahallas });
  } catch (error) {
    return Response.json({ success: false, error: 'INTERNAL_SERVER_ERROR' }, { status: 500 });
  }
}
