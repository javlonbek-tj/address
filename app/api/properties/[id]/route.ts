import { getPropertyById } from '@/server/data/properties';
import { getServerSession } from '@/lib/auth/session';
import { canAccessDistrict, hasMinRole } from '@/lib/auth/authorization';
import { UserRole } from '@/lib/generated/prisma/enums';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession();
  if (!session) {
    return Response.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 },
    );
  }

  try {
    const { id } = await params;

    const property = await getPropertyById(id);
    if (!property) {
      return Response.json(
        { success: false, error: 'Property not found' },
        { status: 404 },
      );
    }

    if (!hasMinRole(session.user, UserRole.admin)) {
      if (!(await canAccessDistrict(session.user, property.district.id))) {
        return Response.json(
          { success: false, error: 'Forbidden' },
          { status: 403 },
        );
      }
    }

    return Response.json({ success: true, data: property });
  } catch (error) {
    return Response.json(
      { success: false, error: 'Internal server error' },
      { status: 500 },
    );
  }
}
