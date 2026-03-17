import { NextRequest } from 'next/server';
import { getDistrictsList } from '@/server';
import { getServerSession } from '@/lib/auth/session';
import { UserRole } from '@/lib/generated/prisma/enums';
import { prisma } from '@/server/prisma';

export async function GET(request: NextRequest) {
  const session = await getServerSession();
  if (!session) {
    return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { user } = session;

    if (user.role === UserRole.district_user) {
      if (!user.districtId) {
        return Response.json({ success: true, data: [] });
      }
      const district = await prisma.district.findUnique({
        where: { id: user.districtId, isActive: true },
        select: { id: true, name: true, code: true, regionId: true },
      });
      return Response.json({ success: true, data: district ? [district] : [] });
    }

    if (user.role === UserRole.region_user) {
      const data = await getDistrictsList(user.regionId ?? 'all');
      return Response.json({ success: true, data });
    }

    const regionId = request.nextUrl.searchParams.get('regionId') || 'all';
    const data = await getDistrictsList(regionId);
    return Response.json({ success: true, data });
  } catch (error) {
    return Response.json({ success: false, error: 'INTERNAL_SERVER_ERROR' }, { status: 500 });
  }
}
