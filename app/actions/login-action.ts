'use server';

import { headers } from 'next/headers';
import { auth } from '@/lib/auth/auth';
import { APIError } from 'better-auth';
import { LoginSchemaType } from '@/lib';

export async function loginAction(data: LoginSchemaType) {
  const { username, password } = data;

  try {
    await auth.api.signInUsername({
      headers: await headers(),
      body: { username, password },
    });
    return { success: true, error: null };
  } catch (error) {
    if (error instanceof APIError) {
      if (error.body?.code === 'INVALID_USERNAME_OR_PASSWORD') {
        return { success: false, message: 'Login yoki parol xato' };
      }
    }
    return { success: false, error: 'Serverda xatolik yuz berdi' };
  }
}
