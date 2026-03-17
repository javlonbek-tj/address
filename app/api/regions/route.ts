import { NextRequest } from 'next/server';
import { getRegionTableData } from '@/server';
import { getServerSession } from '@/lib/auth/session';
import { hasMinRole } from '@/lib/auth/authorization';
import { UserRole } from '@/lib/generated/prisma/enums';

export async function GET(request: NextRequest) {
  const session = await getServerSession();
  if (!session) {
    return Response.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 },
    );
  }

  if (!hasMinRole(session.user, UserRole.admin)) {
    return Response.json(
      { success: false, error: 'Forbidden' },
      { status: 403 },
    );
  }

  try {
    const page = Number(request.nextUrl.searchParams.get('page')) || 1;
    const limit = Number(request.nextUrl.searchParams.get('limit')) || 10;
    const search = request.nextUrl.searchParams.get('search') || '';
    const data = await getRegionTableData({ page, limit, search });
    return Response.json({ success: true, data });
  } catch (error) {
    return Response.json(
      { success: false, error: 'INTERNAL_SERVER_ERROR' },
      { status: 500 },
    );
  }
}
