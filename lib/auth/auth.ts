import { prisma } from '@/server';
import { betterAuth, BetterAuthOptions } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { APIError, createAuthMiddleware } from 'better-auth/api';
import { nextCookies } from 'better-auth/next-js';
import { customSession, username } from 'better-auth/plugins';

const options = {
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),

  user: {
    modelName: 'user',
  },
  session: {
    modelName: 'session',
  },
  account: {
    modelName: 'account',
  },
  plugins: [
    username({
      usernameValidator: (u) => /^[a-zA-Z0-9_.-]+$/.test(u),
      minUsernameLength: 3,
      maxUsernameLength: 100,
    }),
    nextCookies(),
  ],

  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      // Only run on login paths
      if (!ctx.path.startsWith('/login')) return;

      const body = ctx.body as { username: string } | undefined;

      if (!body?.username) return;

      // Look up the AppUser by username via the auth identity
      const authUser = await prisma.user.findFirst({
        where: { username: body.username.toLowerCase() },
        include: { appUser: true },
      });

      if (!authUser?.appUser) return;

      const appUser = authUser.appUser;

      if (!appUser.isActive || appUser.status !== 'active') {
        throw new APIError('FORBIDDEN', {
          message: 'Ruxsat etilmagan foydalanuvchi.',
        });
      }
    }),
  },
} satisfies BetterAuthOptions;

export const auth = betterAuth({
  ...options,
  plugins: [
    ...(options.plugins ?? []),
    // customSession must come after other plugins and receive options for type inference
    customSession(async ({ user, session }) => {
      // Fetch the AppUser profile and attach it to every session response
      const appUser = await prisma.appUser.findUnique({
        where: { authId: user.id },
        select: {
          id: true,
          fullName: true,
          role: true,
          status: true,
          isActive: true,
          position: true,
          regionId: true,
          districtId: true,
          region: { select: { name: true } },
          district: { select: { name: true } },
        },
      });

      return {
        user: {
          ...user,
          appUserId: appUser?.id ?? null,
          role: appUser?.role ?? null,
          status: appUser?.status ?? null,
          isActive: appUser?.isActive ?? true,
          fullName: appUser?.fullName ?? null,
          position: appUser?.position ?? null,
          regionId: appUser?.regionId ?? null,
          districtId: appUser?.districtId ?? null,
          regionName: appUser?.region?.name ?? null,
          districtName: appUser?.district?.name ?? null,
        },
        session,
      };
    }, options),
  ],
});

export type AuthSession = typeof auth.$Infer.Session;
export type SessionUser = AuthSession['user'];
