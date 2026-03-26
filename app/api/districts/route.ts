import { NextRequest } from 'next/server';
import { getDistrictTableData } from '@/server';
import { getServerSession } from '@/lib/auth/session';
import { USER_ROLES } from '@/lib';
import { prisma } from '@/server/prisma';

export async function GET(request: NextRequest) {
  const session = await getServerSession();
  if (!session) {
    return Response.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 },
    );
  }

  const { user } = session;
  const isRegionUser = user.role === USER_ROLES.REGION_USER;
  const isDistrictUser = user.role === USER_ROLES.DISTRICT_USER;

  const page = Number(request.nextUrl.searchParams.get('page')) || 1;
  const limit = Number(request.nextUrl.searchParams.get('limit')) || 10;
  const search = request.nextUrl.searchParams.get('search') || '';

  try {
    // district_user can only see their own district
    if (isDistrictUser) {
      if (!user.districtId) {
        return Response.json({
          success: true,
          data: { data: [], total: 0, page, limit },
        });
      }
      const district = await prisma.district.findUnique({
        where: { id: user.districtId, isActive: true },
        select: { id: true, name: true, code: true, regionId: true },
      });
      return Response.json({
        success: true,
        data: {
          data: district ? [district] : [],
          total: district ? 1 : 0,
          page,
          limit,
        },
      });
    }

    // region_user can only see their own region's districts
    const rawRegionId = request.nextUrl.searchParams.get('regionId') || '';
    const regionId = isRegionUser
      ? (user.regionId ?? '')
      : rawRegionId === 'all'
        ? undefined
        : rawRegionId;

    const data = await getDistrictTableData({ page, limit, search, regionId });
    return Response.json({ success: true, data });
  } catch (error) {
    return Response.json(
      { success: false, error: 'INTERNAL_SERVER_ERROR' },
      { status: 500 },
    );
  }
}
