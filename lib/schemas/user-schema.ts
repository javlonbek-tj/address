import * as z from 'zod';
import { USER_ROLES, USER_STATUSES } from '../constants';

export const userSchema = z
  .object({
    status: z.string().min(1, 'Majburiy maydon'),
    fullName: z.string().optional(),
    phoneNumber: z.string().optional(),
    role: z.string().min(1, 'Majburiy maydon'),
    position: z.string().optional().nullable(),
    regionId: z.string().optional().nullable(),
    districtId: z.string().optional().nullable(),
  })
  .superRefine((data, ctx) => {
    if (data.status === USER_STATUSES.ACTIVE) {
      if (!data.fullName || data.fullName.trim().length < 6) {
        ctx.addIssue({
          code: 'custom',
          message: 'Toʻliq ism kamida 6 ta belgidan iborat boʻlishi kerak',
          path: ['fullName'],
        });
      }
      if (!data.phoneNumber || data.phoneNumber.trim().length < 9) {
        ctx.addIssue({
          code: 'custom',
          message: 'Notoʻgʻri telefon raqami formati',
          path: ['phoneNumber'],
        });
      }
    }
  });

export type UserFormValues = z.infer<typeof userSchema>;
export { USER_ROLES, USER_STATUSES };
