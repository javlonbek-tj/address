import { NextRequest } from 'next/server';
import { getDistrictTableData } from '@/server';
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
  const isAdmin = hasMinRole(user, UserRole.admin);
  const isRegionUser = user.role === USER_ROLES.REGION_USER;

  const page = Number(request.nextUrl.searchParams.get('page')) || 1;
  const limit = Number(request.nextUrl.searchParams.get('limit')) || 10;
  const search = request.nextUrl.searchParams.get('search') || '';

  // region_user can only see their own region's districts
  const rawRegionId = request.nextUrl.searchParams.get('regionId') || '';
  const regionId = isRegionUser
    ? (user.regionId ?? '')
    : rawRegionId === 'all' ? undefined : rawRegionId;

  try {
    const data = await getDistrictTableData({ page, limit, search, regionId });
    return Response.json({ success: true, data });
  } catch (error) {
    return Response.json({ success: false, error: 'INTERNAL_SERVER_ERROR' }, { status: 500 });
  }
}
