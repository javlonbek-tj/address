import { RegionTable } from '@/components/addressData';
import { Spinner } from '@/components/shared';
import { Suspense } from 'react';
import { getServerSession } from '@/lib/auth/session';
import { assertMinRole } from '@/lib/auth/authorization';
import { UserRole } from '@/lib/generated/prisma/enums';
import { USER_ROLES } from '@/lib';

export default async function RegionsPage() {
  const session = await getServerSession();
  assertMinRole(session!.user, UserRole.admin);

  const isSuperadmin = session!.user.role === USER_ROLES.SUPERADMIN || session!.user.role === USER_ROLES.SUPERUSER;

  return (
    <Suspense fallback={<Spinner />}>
      <RegionTable isSuperadmin={isSuperadmin} />
    </Suspense>
  );
}
