import { Suspense } from 'react';
import { getServerSession } from '@/lib/auth/session';
import { assertMinRole } from '@/lib/auth/authorization';
import { UserRole } from '@/lib/generated/prisma/enums';
import { USER_ROLES } from '@/lib';
import { Spinner } from '@/components/shared';
import { ReportsTable } from '@/components/reports';

export default async function ReportsPage() {
  const session = await getServerSession();
  assertMinRole(session!.user, UserRole.district_user);

  const role = session!.user.role as string;
  const isAdmin =
    role === USER_ROLES.SUPERADMIN ||
    role === USER_ROLES.SUPERUSER ||
    role === USER_ROLES.ADMIN;
  const isRegionUser = role === USER_ROLES.REGION_USER;
  const isDistrictUser = role === USER_ROLES.DISTRICT_USER;

  return (
    <Suspense fallback={<Spinner />}>
      <ReportsTable
        isAdmin={isAdmin}
        lockedRegionId={
          isRegionUser || isDistrictUser
            ? (session!.user.regionId ?? null)
            : null
        }
        lockedDistrictId={
          isDistrictUser ? (session!.user.districtId ?? null) : null
        }
      />
    </Suspense>
  );
}
