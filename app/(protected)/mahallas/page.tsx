import { MahallaTable } from '@/components/addressData';
import { Spinner } from '@/components/shared';
import { Suspense } from 'react';
import { getServerSession } from '@/lib/auth/session';
import { assertMinRole } from '@/lib/auth/authorization';
import { UserRole } from '@/lib/generated/prisma/enums';
import { USER_ROLES } from '@/lib';

export default async function MahallasPage() {
  const session = await getServerSession();
  assertMinRole(session!.user, UserRole.district_user);

  const userRole = session!.user.role as string;
  const isSuperadmin = userRole === USER_ROLES.SUPERADMIN || userRole === USER_ROLES.SUPERUSER;
  const isRegionLocked = userRole === USER_ROLES.REGION_USER;
  const isDistrictLocked = userRole === USER_ROLES.DISTRICT_USER;
  const userRegionId = session!.user.regionId ?? null;
  const userDistrictId = session!.user.districtId ?? null;

  return (
    <Suspense fallback={<Spinner />}>
      <MahallaTable
        isSuperadmin={isSuperadmin}
        isRegionLocked={isRegionLocked}
        isDistrictLocked={isDistrictLocked}
        userRegionId={userRegionId}
        userDistrictId={userDistrictId}
      />
    </Suspense>
  );
}
