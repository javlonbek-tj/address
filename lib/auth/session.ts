import { auth } from './auth';
import { headers } from 'next/headers';

/**
 * Get the current session on the server.
 * Returns null if the user is not authenticated.
 */
export async function getServerSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  return session;
}

/**
 * Get the current session and throw a redirect if not authenticated.
 * Use in Server Components / Server Actions that require auth.
 */
export async function requireSession() {
  const session = await getServerSession();
  if (!session) {
    throw new Error('UNAUTHENTICATED');
  }
  return session;
}
