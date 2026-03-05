import * as z from 'zod';
import { USER_ROLES, USER_STATUSES } from '../constants';

export const userSchema = z.object({
  fullName: z
    .string()
    .min(6, 'Toʻliq ism kamida 6 ta belgidan iborat boʻlishi kerak'),
  phoneNumber: z.string().min(9, 'Telefon raqami notoʻgʻri'),
  role: z.string().min(1, 'Rolni tanlang'),
  status: z.string(),
  position: z.string().optional().nullable(),
  regionId: z.string().optional().nullable(),
  districtId: z.string().optional().nullable(),
});

export type UserFormValues = z.infer<typeof userSchema>;
export { USER_ROLES, USER_STATUSES };
