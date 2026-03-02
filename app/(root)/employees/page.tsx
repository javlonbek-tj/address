import React, { Suspense } from 'react';
import { UserTable } from '@/components/addressData/user';
import { Spinner } from '@/components/shared';

export default function EmployeesPage() {
  return (
    <div className='flex flex-col h-full bg-gray-50/50 dark:bg-gray-900/50'>
      <Suspense fallback={<Spinner />}>
        <UserTable />
      </Suspense>
    </div>
  );
}
