import { NextRequest } from 'next/server';
import { getMahallaTableData } from '@/server';
import { getServerSession } from '@/lib/auth/session';
import { hasMinRole } from '@/lib/auth/authorization';
import { UserRole } from '@/lib/generated/prisma/enums';
import { USER_ROLES } from '@/lib';

export async function GET(request: NextRequest) {
  const session = await getServerSession();
  if (!session) {
    return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const { user } = session;
  const isRegionUser = user.role === USER_ROLES.REGION_USER;
  const isDistrictUser = user.role === USER_ROLES.DISTRICT_USER;

  const page = Number(request.nextUrl.searchParams.get('page')) || 1;
  const limit = Number(request.nextUrl.searchParams.get('limit')) || 10;
  const search = request.nextUrl.searchParams.get('search') || '';
  const isOptimized = request.nextUrl.searchParams.get('isOptimized') || 'all';

  const rawRegionId = request.nextUrl.searchParams.get('regionId') || '';
  const rawDistrictId = request.nextUrl.searchParams.get('districtId') || '';

  const regionId = (isRegionUser || isDistrictUser)
    ? (user.regionId ?? '')
    : rawRegionId === 'all' ? undefined : rawRegionId;

  const districtId = isDistrictUser
    ? (user.districtId ?? '')
    : rawDistrictId === 'all' ? undefined : rawDistrictId;

  try {
    const data = await getMahallaTableData({
      page,
      limit,
      search,
      regionId,
      districtId,
      isOptimized,
    });
    return Response.json({ success: true, data });
  } catch (error) {
    return Response.json({ success: false, error: 'INTERNAL_SERVER_ERROR' }, { status: 500 });
  }
}
