'use server';

import type { ActionResult } from '@/types';
import type { SessionUser } from '@/lib/auth/auth';
import {
  batchAssignSchema,
  propertyAssignSchema,
  type BatchAssignSchemaType,
  type PropertyAssignSchemaType,
} from '@/lib/schemas/property-schema';
import { getServerSession } from '@/lib/auth/session';
import { assertActive, canWriteDistrict, isSuperuser } from '@/lib/auth/authorization';
import { SUPERUSER_DENIED_MESSAGE } from '@/lib/constants/user';
import {
  assignErrorMessage,
  assignPropertyAddresses,
  deleteReservedNumber,
  getStreetDistrictId,
  type AssignItem,
} from '@/server/data/properties';

type AssignActionResult = ActionResult<{ count: number } | { numbers: string[] }>;

async function getWriter(): Promise<{ user: SessionUser } | { denied: AssignActionResult }> {
  const session = await getServerSession();
  if (!session) return { denied: { success: false, error: 'UNAUTHENTICATED' } };
  assertActive(session.user);
  if (isSuperuser(session.user)) {
    return { denied: { success: false, message: SUPERUSER_DENIED_MESSAGE } };
  }
  return { user: session.user };
}

async function authorizeStreet(user: SessionUser, streetId: string): Promise<AssignActionResult | null> {
  const districtId = await getStreetDistrictId(streetId);
  if (!districtId) return { success: false, error: 'STREET_NOT_FOUND', message: "Ko'cha topilmadi" };
  if (!(await canWriteDistrict(user, districtId))) {
    return { success: false, error: 'FORBIDDEN', message: "Bu tuman uchun ruxsatingiz yo'q" };
  }
  return null;
}

async function assign(
  user: SessionUser,
  streetId: string,
  items: AssignItem[],
  options: { reserve?: string[]; useReserved?: boolean } = {},
): Promise<AssignActionResult> {
  const denied = await authorizeStreet(user, streetId);
  if (denied) return denied;

  const result = await assignPropertyAddresses(streetId, items, undefined, { ...options, userId: user.id });
  if (result.ok) return { success: true, data: { count: result.count } };
  return {
    success: false,
    error: result.error,
    message: assignErrorMessage(result),
    ...('numbers' in result ? { data: { numbers: result.numbers } } : {}),
  };
}

// `useReserved` is true only when the number was picked from the street's reserve list.
export async function assignHouseNumberAction(
  propertyId: string,
  data: PropertyAssignSchemaType,
  useReserved = false,
): Promise<AssignActionResult> {
  const writer = await getWriter();
  if ('denied' in writer) return writer.denied;

  const parsed = propertyAssignSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: 'VALIDATION_ERROR', message: parsed.error.issues[0].message };
  }
  return assign(writer.user, parsed.data.streetId, [{ propertyId, houseNumber: parsed.data.houseNumber }], {
    useReserved,
  });
}

export async function releaseReservedNumberAction(streetId: string, houseNumber: string): Promise<ActionResult> {
  const writer = await getWriter();
  if ('denied' in writer) return writer.denied as ActionResult;

  const denied = await authorizeStreet(writer.user, streetId);
  if (denied) return denied as ActionResult;

  const deleted = await deleteReservedNumber(streetId, houseNumber);
  return deleted ? { success: true } : { success: false, message: 'Zaxira raqam topilmadi' };
}

export async function batchAssignHouseNumbersAction(input: BatchAssignSchemaType): Promise<AssignActionResult> {
  const writer = await getWriter();
  if ('denied' in writer) return writer.denied;

  const parsed = batchAssignSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: 'VALIDATION_ERROR', message: parsed.error.issues[0].message };
  }
  return assign(writer.user, parsed.data.streetId, parsed.data.assignments, { reserve: parsed.data.reserved });
}
