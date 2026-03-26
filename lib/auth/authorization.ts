import { redirect } from 'next/navigation';
import { UserRole, UserStatus } from '../generated/prisma/enums';
import type { SessionUser } from './auth';
import { prisma } from '@/server';
import { ROLE_HIERARCHY } from '@/lib/constants/user';

/** Returns true if the user's role is at least `minRole`. */
export function hasMinRole(user: SessionUser, minRole: UserRole): boolean {
  const userLevel = ROLE_HIERARCHY[user.role as UserRole] ?? 0;
  const requiredLevel = ROLE_HIERARCHY[minRole];
  return userLevel >= requiredLevel;
}

/** Returns true if the user has exactly one of the specified roles. */
export function hasRole(user: SessionUser, ...roles: UserRole[]): boolean {
  return roles.includes(user.role as UserRole);
}

// ─── Account status guards ─────────────────────────────────────────
export function isAccountActive(user: SessionUser): boolean {
  return user.isActive === true && user.status === UserStatus.active;
}

/** Region users can only access data within their regionId. */
export function canAccessRegion(user: SessionUser, regionId: string): boolean {
  if (hasMinRole(user, UserRole.admin)) return true;
  return user.regionId === regionId;
}

/** District users can only access data within their districtId. */
export async function canAccessDistrict(
  user: SessionUser,
  districtId: string,
): Promise<boolean> {
  // admin va superadmin hamma narsani ko‘ra oladi
  if (hasMinRole(user, UserRole.admin)) return true;

  // region_user faqat o'z regionidagi districtlarni ko‘ra oladi
  if (hasRole(user, UserRole.region_user) && user.regionId) {
    const district = await prisma.district.findUnique({
      where: { id: districtId },
      select: { regionId: true },
    });

    if (!district) return false;

    return district.regionId === user.regionId;
  }

  // district_user faqat o‘z districtini ko‘ra oladi
  return user.districtId === districtId;
}

export function assertActive(user: SessionUser, redirectTo = '/suspended') {
  if (!isAccountActive(user)) redirect(redirectTo);
}

export function assertRole(
  user: SessionUser,
  roles: UserRole[],
  redirectTo = '/unauthorized',
) {
  if (!hasRole(user, ...roles)) redirect(redirectTo);
}

export function assertMinRole(
  user: SessionUser,
  minRole: UserRole,
  redirectTo = '/unauthorized',
) {
  if (!hasMinRole(user, minRole)) redirect(redirectTo);
}

export function assertRegionAccess(
  user: SessionUser,
  regionId: string,
  redirectTo = '/unauthorized',
) {
  if (!canAccessRegion(user, regionId)) redirect(redirectTo);
}

export function assertDistrictAccess(
  user: SessionUser,
  districtId: string,
  redirectTo = '/unauthorized',
) {
  if (!canAccessDistrict(user, districtId)) redirect(redirectTo);
}

export function isSuperuser(user: SessionUser): boolean {
  return user.role === UserRole.superuser;
}

export function assertSuperadmin(
  user: SessionUser,
  redirectTo = '/unauthorized',
) {
  if (!hasRole(user, UserRole.superadmin, UserRole.superuser)) redirect(redirectTo);
}
