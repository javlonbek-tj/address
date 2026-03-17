import { NextResponse } from 'next/server';
import { getUserTableData } from '@/server/data/users';
import { getServerSession } from '@/lib/auth/session';
import { hasMinRole } from '@/lib/auth/authorization';
import { UserRole } from '@/lib/generated/prisma/enums';

export async function GET(request: Request) {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 },
    );
  }

  const { user } = session;
  const { searchParams } = new URL(request.url);
  const page = Number(searchParams.get('page')) || 1;
  const limit = Number(searchParams.get('limit')) || 10;
  const search = searchParams.get('search') || '';
  const role = searchParams.get('role') || 'all';
  const status = searchParams.get('status') || 'all';

  const isAdmin = hasMinRole(user, UserRole.admin);
  const isDistrictUser = user.role === UserRole.district_user;

  // region_user can only see their own region's users
  const regionId = isAdmin
    ? searchParams.get('regionId') || 'all'
    : (user.regionId ?? 'all');

  // district_user can only see users in their own district
  const districtId = isDistrictUser
    ? (user.districtId ?? 'all')
    : searchParams.get('districtId') || 'all';

  try {
    const data = await getUserTableData({
      page,
      limit,
      search,
      role,
      status,
      regionId,
      districtId,
    });
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    );
  }
}
