import { NextRequest } from 'next/server';
import { getDistrictsByRegionId } from '@/server';
import { getServerSession } from '@/lib/auth/session';
import { canAccessRegion } from '@/lib/auth/authorization';
import { UserRole } from '@/lib/generated/prisma/enums';
import { prisma } from '@/server/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session) {
      return Response.json({ success: false, error: 'UNAUTHENTICATED' }, { status: 401 });
    }

    const regionId = request.nextUrl.searchParams.get('regionId');
    if (!regionId) {
      return Response.json(
        { success: false, error: 'Region ID required' },
        { status: 400 },
      );
    }

    const user = session.user;

    if (!canAccessRegion(user, regionId)) {
      return Response.json({ success: false, error: 'FORBIDDEN' }, { status: 403 });
    }

    // district_user can only see their own district
    if (user.role === UserRole.district_user) {
      if (!user.districtId) {
        return Response.json({ success: true, data: [] });
      }
      const district = await prisma.district.findUnique({
        where: { id: user.districtId, isActive: true },
      });
      return Response.json({ success: true, data: district ? [district] : [] });
    }

    const data = await getDistrictsByRegionId(regionId);
    return Response.json({ success: true, data });
  } catch (error) {
    return Response.json({ success: false, error: 'INTERNAL_SERVER_ERROR' }, { status: 500 });
  }
}
