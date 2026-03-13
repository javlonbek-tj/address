import { Suspense } from 'react';
import { SessionsTable } from '@/components/addressData/sessions/SessionsTable';
import { Spinner } from '@/components/shared';
import { getServerSession } from '@/lib/auth/session';
import { assertSuperadmin } from '@/lib/auth/authorization';

export default async function SessionsPage() {
  const session = await getServerSession();
  assertSuperadmin(session!.user);

  return (
    <div className='flex flex-col h-full bg-gray-50/50 dark:bg-gray-900/50'>
      <Suspense fallback={<Spinner />}>
        <SessionsTable />
      </Suspense>
    </div>
  );
}
