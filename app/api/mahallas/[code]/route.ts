import { getMahallaByCode } from '@/server';
import { getServerSession } from '@/lib/auth/session';
import { canAccessDistrict, hasMinRole } from '@/lib/auth/authorization';
import { UserRole } from '@/lib/generated/prisma/enums';
import { prisma } from '@/server/prisma';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ code: string }> },
) {
  const session = await getServerSession();
  if (!session) {
    return Response.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 },
    );
  }

  try {
    const { code } = await params;

    if (!hasMinRole(session.user, UserRole.admin)) {
      const mahalla = await prisma.mahalla.findUnique({
        where: { code },
        select: { districtId: true },
      });
      if (!mahalla) {
        return Response.json(
          { success: false, error: 'Mahalla not found' },
          { status: 404 },
        );
      }
      if (!(await canAccessDistrict(session.user, mahalla.districtId))) {
        return Response.json(
          { success: false, error: 'Forbidden' },
          { status: 403 },
        );
      }
    }

    const mahalla = await getMahallaByCode(code);
    if (!mahalla) {
      return Response.json(
        { success: false, error: 'Mahalla not found' },
        { status: 404 },
      );
    }
    return Response.json({ success: true, data: mahalla });
  } catch (error) {
    return Response.json(
      { success: false, error: 'Internal server error' },
      { status: 500 },
    );
  }
}
