import { NextRequest } from 'next/server';
import { getRegionsList } from '@/server';
import { getServerSession } from '@/lib/auth/session';
import { hasMinRole } from '@/lib/auth/authorization';
import { UserRole } from '@/lib/generated/prisma/enums';
import { prisma } from '@/server/prisma';

export async function GET(request: NextRequest) {
  const session = await getServerSession();
  if (!session) {
    return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { user } = session;

    if (!hasMinRole(user, UserRole.admin)) {
      if (!user.regionId) {
        return Response.json({ success: true, data: [] });
      }
      const region = await prisma.region.findUnique({
        where: { id: user.regionId, isActive: true },
        select: { id: true, name: true, code: true },
      });
      return Response.json({ success: true, data: region ? [region] : [] });
    }

    const data = await getRegionsList();
    return Response.json({ success: true, data });
  } catch (error) {
    return Response.json({ success: false, error: 'INTERNAL_SERVER_ERROR' }, { status: 500 });
  }
}
