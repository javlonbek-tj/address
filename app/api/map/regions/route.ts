import { NextRequest } from 'next/server';
import { getRegions } from '@/server';
import { getServerSession } from '@/lib/auth/session';
import { hasMinRole } from '@/lib/auth/authorization';
import { UserRole } from '@/lib/generated/prisma/enums';
import { prisma } from '@/server/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session) {
      return Response.json(
        { success: false, error: 'UNAUTHENTICATED' },
        { status: 401 },
      );
    }

    const user = session.user;

    // Restricted roles: only expose their own region
    if (!hasMinRole(user, UserRole.admin)) {
      if (!user.regionId) {
        return Response.json({ success: true, data: [] });
      }
      const region = await prisma.region.findUnique({
        where: { id: user.regionId, isActive: true },
      });
      return Response.json({ success: true, data: region ? [region] : [] });
    }

    const data = await getRegions();
    return Response.json({ success: true, data });
  } catch (error) {
    return Response.json(
      { success: false, error: 'INTERNAL_SERVER_ERROR' },
      { status: 500 },
    );
  }
}
