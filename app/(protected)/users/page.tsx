import React, { Suspense } from 'react';
import { UserTable } from '@/components/addressData/user';
import { Spinner } from '@/components/shared';
import { getServerSession } from '@/lib/auth/session';
import { assertMinRole } from '@/lib/auth/authorization';
import { UserRole } from '@/lib/generated/prisma/enums';
import { USER_ROLES } from '@/lib';

export default async function UsersPage() {
  const session = await getServerSession();
  assertMinRole(session!.user, UserRole.region_user);

  const userRole = session!.user.role as string;
  const isRegionLocked = userRole === USER_ROLES.REGION_USER;
  const userRegionId = session!.user.regionId ?? null;
  const isSuperadmin = userRole === USER_ROLES.SUPERADMIN || userRole === USER_ROLES.SUPERUSER;

  return (
    <div className='flex flex-col h-full bg-gray-50/50 dark:bg-gray-900/50'>
      <Suspense fallback={<Spinner />}>
        <UserTable
          isRegionLocked={isRegionLocked}
          userRegionId={userRegionId}
          isSuperadmin={isSuperadmin}
        />
      </Suspense>
    </div>
  );
}
