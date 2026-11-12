import {
  assignErrorMessage,
  assignErrorStatus,
  assignPropertyAddresses,
  getStreetDistrictId,
} from '@/server';
import { getServerSession } from '@/lib/auth/session';
import { canWriteDistrict, isAccountActive, isSuperuser } from '@/lib/auth/authorization';
import { batchAssignSchema } from '@/lib/schemas/property-schema';

export async function POST(request: Request) {
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

  const parsed = batchAssignSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return Response.json(
      { success: false, error: 'VALIDATION_ERROR', message: parsed.error.issues[0].message },
      { status: 400 },
    );
  }

  try {
    const { streetId, assignments, reserved } = parsed.data;
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

    const result = await assignPropertyAddresses(streetId, assignments, undefined, {
      reserve: reserved,
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
    return Response.json({ success: true, data: { count: result.count } });
  } catch {
    return Response.json({ success: false, error: 'INTERNAL_SERVER_ERROR' }, { status: 500 });
  }
}
