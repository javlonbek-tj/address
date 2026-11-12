import {
  assignErrorMessage,
  assignErrorStatus,
  assignPropertyAddresses,
  getPropertyById,
  getStreetDistrictId,
} from '@/server';
import { getServerSession } from '@/lib/auth/session';
import {
  canAccessDistrict,
  canWriteDistrict,
  isAccountActive,
  isSuperuser,
} from '@/lib/auth/authorization';
import { propertyAssignSchema } from '@/lib/schemas/property-schema';

type Context = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Context) {
  const session = await getServerSession();
  if (!session) {
    return Response.json({ success: false, error: 'UNAUTHENTICATED' }, { status: 401 });
  }
  if (!isAccountActive(session.user)) {
    return Response.json({ success: false, error: 'ACCOUNT_SUSPENDED' }, { status: 403 });
  }

  try {
    const { id } = await params;
    const property = await getPropertyById(id);
    if (!property) {
      return Response.json({ success: false, error: 'NOT_FOUND' }, { status: 404 });
    }
    if (!(await canAccessDistrict(session.user, property.districtId))) {
      return Response.json({ success: false, error: 'FORBIDDEN' }, { status: 403 });
    }
    return Response.json({ success: true, data: property });
  } catch {
    return Response.json({ success: false, error: 'INTERNAL_SERVER_ERROR' }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: Context) {
  const session = await getServerSession();
  if (!session) {
    return Response.json({ success: false, error: 'UNAUTHENTICATED' }, { status: 401 });
  }
  if (!isAccountActive(session.user)) {
    return Response.json({ success: false, error: 'ACCOUNT_SUSPENDED' }, { status: 403 });
  }
  if (isSuperuser(session.user)) {
    return Response.json({ success: false, error: 'FORBIDDEN' }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const parsed = propertyAssignSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { success: false, error: 'VALIDATION_ERROR', message: parsed.error.issues[0].message },
      { status: 400 },
    );
  }

  try {
    const { id } = await params;
    const { streetId, houseNumber } = parsed.data;
    const districtId = await getStreetDistrictId(streetId);
    if (!districtId) {
      return Response.json(
        { success: false, error: 'STREET_NOT_FOUND', message: "Ko'cha topilmadi" },
        { status: 404 },
      );
    }
    if (!(await canWriteDistrict(session.user, districtId))) {
      return Response.json({ success: false, error: 'FORBIDDEN' }, { status: 403 });
    }

    const result = await assignPropertyAddresses(streetId, [{ propertyId: id, houseNumber }], undefined, {
      useReserved: body?.useReserved === true,
      userId: session.user.id,
    });
    if (!result.ok) {
      return Response.json(
        {
          success: false,
          error: result.error,
          message: assignErrorMessage(result),
          ...('numbers' in result ? { numbers: result.numbers } : {}),
        },
        { status: assignErrorStatus(result) },
      );
    }
    return Response.json({ success: true, data: await getPropertyById(id) });
  } catch {
    return Response.json({ success: false, error: 'INTERNAL_SERVER_ERROR' }, { status: 500 });
  }
}
