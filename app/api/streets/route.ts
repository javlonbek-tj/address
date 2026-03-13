import { NextRequest } from 'next/server';
import { getStreetTableData } from '@/server';
import { getServerSession } from '@/lib/auth/session';
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
  const mahallaId = request.nextUrl.searchParams.get('mahallaId') || '';

  const rawRegionId = request.nextUrl.searchParams.get('regionId') || '';
  const rawDistrictId = request.nextUrl.searchParams.get('districtId') || '';

  const regionId = (isRegionUser || isDistrictUser)
    ? (user.regionId ?? '')
    : rawRegionId === 'all' ? undefined : rawRegionId;

  const districtId = isDistrictUser
    ? (user.districtId ?? '')
    : rawDistrictId === 'all' ? undefined : rawDistrictId;

  try {
    const data = await getStreetTableData({
      page,
      limit,
      search,
      regionId,
      districtId,
      mahallaId,
    });

    return Response.json({ success: true, data });
  } catch (error) {
    return Response.json({ success: false, error: 'INTERNAL_SERVER_ERROR' }, { status: 500 });
  }
}
