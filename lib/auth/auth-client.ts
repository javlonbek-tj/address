import { createAuthClient } from 'better-auth/react';
import {
  usernameClient,
  customSessionClient,
} from 'better-auth/client/plugins';
import type { auth } from '@/lib/auth/auth';

export const authClient = createAuthClient({
  // Only needed if your auth server runs on a different origin
  baseURL: process.env.NEXT_PUBLIC_APP_URL,
  plugins: [usernameClient(), customSessionClient<typeof auth>()],
});

export const { signIn, signUp, signOut, useSession, getSession } = authClient;
