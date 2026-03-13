import { redirect } from 'next/navigation';
import { getServerSession } from '@/lib/auth/session';
import { assertActive, assertMinRole } from '@/lib/auth/authorization';
import { UserRole } from '@/lib/generated/prisma/enums';

export default async function SuperadminPage() {
  const session = await getServerSession();
  if (!session) redirect('/login');

  assertActive(session.user);
  assertMinRole(session.user, UserRole.superadmin);

  return (
    <main>
      <h1>Superadmin Panel</h1>
      <p>Welcome, {session.user.fullName}</p>
    </main>
  );
}
