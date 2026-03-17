import { getStreetListByDistrictId } from '@/server';
import { getServerSession } from '@/lib/auth/session';
import { canAccessDistrict } from '@/lib/auth/authorization';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ districtId: string }> },
) {
  const session = await getServerSession();
  if (!session) {
    return Response.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 },
    );
  }

  try {
    const { districtId } = await params;

    if (!(await canAccessDistrict(session.user, districtId))) {
      return Response.json(
        { success: false, error: 'Forbidden' },
        { status: 403 },
      );
    }

    const streets = await getStreetListByDistrictId(districtId);
    return Response.json({ success: true, data: streets });
  } catch (error) {
    return Response.json(
      { success: false, error: 'Internal server error' },
      { status: 500 },
    );
  }
}
