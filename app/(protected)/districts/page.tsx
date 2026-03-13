import { DistrictTable } from '@/components/addressData';
import { Spinner } from '@/components/shared';
import { Suspense } from 'react';
import { getServerSession } from '@/lib/auth/session';
import { assertMinRole } from '@/lib/auth/authorization';
import { UserRole } from '@/lib/generated/prisma/enums';
import { USER_ROLES } from '@/lib';

export default async function DistrictsPage() {
  const session = await getServerSession();
  assertMinRole(session!.user, UserRole.region_user);

  const userRole = session!.user.role as string;
  const isRegionLocked = userRole === USER_ROLES.REGION_USER;
  const userRegionId = session!.user.regionId ?? null;
  const isSuperadmin = userRole === USER_ROLES.SUPERADMIN;

  return (
    <Suspense fallback={<Spinner />}>
      <DistrictTable isRegionLocked={isRegionLocked} userRegionId={userRegionId} isSuperadmin={isSuperadmin} />
    </Suspense>
  );
}
