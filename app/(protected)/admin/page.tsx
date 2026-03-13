import { assertActive, assertMinRole } from '@/lib/auth/authorization';
import { getServerSession } from '@/lib/auth/session';
import { UserRole } from '@/lib/generated/prisma/enums';
import { redirect } from 'next/navigation';

export default async function AdminPage() {
  const session = await getServerSession();
  if (!session) redirect('/login');

  assertActive(session.user);
  assertMinRole(session.user, UserRole.admin);

  return (
    <main>
      <h1>Admin Dashboard</h1>
    </main>
  );
}
