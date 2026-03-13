import { NextRequest } from 'next/server';
import { getStreetsByDistrictId } from '@/server';
import { getServerSession } from '@/lib/auth/session';
import { canAccessDistrict } from '@/lib/auth/authorization';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session) {
      return Response.json({ success: false, error: 'UNAUTHENTICATED' }, { status: 401 });
    }

    const districtId = request.nextUrl.searchParams.get('districtId');
    if (!districtId) {
      return Response.json(
        { success: false, error: 'District ID required' },
        { status: 400 },
      );
    }

    if (!await canAccessDistrict(session.user, districtId)) {
      return Response.json({ success: false, error: 'FORBIDDEN' }, { status: 403 });
    }

    const data = await getStreetsByDistrictId(districtId);
    return Response.json({ success: true, data });
  } catch (error) {
    return Response.json({ success: false, error: 'INTERNAL_SERVER_ERROR' }, { status: 500 });
  }
}
