import * as z from 'zod';

export const changePasswordSchema = z
  .object({
    oldPassword: z.string().min(1, 'Majburiy maydon'),
    newPassword: z.string().min(6, 'Parol kamida 6 ta belgidan iborat boʻlishi kerak'),
    confirmPassword: z.string().min(1, 'Majburiy maydon'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Parollar mos kelmaydi',
    path: ['confirmPassword'],
  });

export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;
