import { NextRequest } from 'next/server';
import { getServerSession } from '@/lib/auth/session';
import { getStreetsReport } from '@/server';
import { USER_ROLES } from '@/lib';

export async function GET(request: NextRequest) {
  const session = await getServerSession();
  if (!session) {
    return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const { user } = session;
  const isDistrictUser = user.role === USER_ROLES.DISTRICT_USER;
  const isRegionUser = user.role === USER_ROLES.REGION_USER;

  // Force scope based on role — ignore query params for lower roles
  const regionId = isDistrictUser || isRegionUser
    ? (user.regionId ?? undefined)
    : request.nextUrl.searchParams.get('regionId') || undefined;

  const districtId = isDistrictUser
    ? (user.districtId ?? undefined)
    : request.nextUrl.searchParams.get('districtId') || undefined;

  try {
    const data = await getStreetsReport({ regionId, districtId });
    return Response.json({ success: true, data });
  } catch {
    return Response.json({ success: false, error: 'INTERNAL_SERVER_ERROR' }, { status: 500 });
  }
}
