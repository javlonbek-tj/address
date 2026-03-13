import { NextRequest } from 'next/server';
import { getPropertiesByMahallaCode } from '@/server/data/properties';
import { getServerSession } from '@/lib/auth/session';
import { canAccessDistrict, hasMinRole } from '@/lib/auth/authorization';
import { UserRole } from '@/lib/generated/prisma/enums';
import { prisma } from '@/server/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session) {
      return Response.json({ success: false, error: 'UNAUTHENTICATED' }, { status: 401 });
    }

    const mahallaCode = request.nextUrl.searchParams.get('mahallaCode');
    if (!mahallaCode) {
      return Response.json(
        { success: false, error: 'Mahalla Code required' },
        { status: 400 },
      );
    }

    const user = session.user;

    // Admin and superadmin can access everything
    if (!hasMinRole(user, UserRole.admin)) {
      const mahalla = await prisma.mahalla.findUnique({
        where: { code: mahallaCode },
        select: { districtId: true },
      });

      if (!mahalla) {
        return Response.json({ success: false, error: 'NOT_FOUND' }, { status: 404 });
      }

      if (!await canAccessDistrict(user, mahalla.districtId)) {
        return Response.json({ success: false, error: 'FORBIDDEN' }, { status: 403 });
      }
    }

    const data = await getPropertiesByMahallaCode(mahallaCode);
    return Response.json({ success: true, data });
  } catch (error) {
    return Response.json({ success: false, error: 'INTERNAL_SERVER_ERROR' }, { status: 500 });
  }
}
