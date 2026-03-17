import { NextRequest } from 'next/server';
import { getGlobalStatistics, getRegionStatistics, getDistrictStatistics } from '@/server';
import { getServerSession } from '@/lib/auth/session';
import { UserRole } from '@/lib/generated/prisma/enums';

export async function GET(request: NextRequest) {
  const session = await getServerSession();
  if (!session) {
    return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { user } = session;

    if (user.role === UserRole.district_user) {
      const data = await getDistrictStatistics(user.districtId ?? '');
      return Response.json({ success: true, data });
    }

    if (user.role === UserRole.region_user) {
      const data = await getRegionStatistics(user.regionId ?? '');
      return Response.json({ success: true, data });
    }

    const regionId = request.nextUrl.searchParams.get('regionId');
    const districtId = request.nextUrl.searchParams.get('districtId');
    let data;
    if (districtId) {
      data = await getDistrictStatistics(districtId);
    } else if (regionId) {
      data = await getRegionStatistics(regionId);
    } else {
      data = await getGlobalStatistics();
    }

    return Response.json({ success: true, data });
  } catch (error) {
    return Response.json({ success: false, error: 'INTERNAL_SERVER_ERROR' }, { status: 500 });
  }
}
