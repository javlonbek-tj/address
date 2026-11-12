import { NextRequest } from 'next/server';
import { getReservedNumbersByDistrict } from '@/server';
import { getServerSession } from '@/lib/auth/session';
import { canAccessDistrict, isAccountActive } from '@/lib/auth/authorization';

export async function GET(request: NextRequest) {
  const session = await getServerSession();
  if (!session) {
    return Response.json({ success: false, error: 'UNAUTHENTICATED' }, { status: 401 });
  }
  if (!isAccountActive(session.user)) {
    return Response.json({ success: false, error: 'ACCOUNT_SUSPENDED' }, { status: 403 });
  }

  const districtId = request.nextUrl.searchParams.get('districtId');
  if (!districtId) {
    return Response.json({ success: false, error: 'District ID required' }, { status: 400 });
  }

  try {
    if (!(await canAccessDistrict(session.user, districtId))) {
      return Response.json({ success: false, error: 'FORBIDDEN' }, { status: 403 });
    }
    return Response.json({ success: true, data: await getReservedNumbersByDistrict(districtId) });
  } catch {
    return Response.json({ success: false, error: 'INTERNAL_SERVER_ERROR' }, { status: 500 });
  }
}
