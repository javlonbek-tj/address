import * as z from 'zod';
import { USER_ROLES, USER_STATUSES } from '../constants';

const sharedUserFields = z.object({
  status: z.string().min(1, 'Majburiy maydon'),
  fullName: z.string().optional(),
  phoneNumber: z.string().optional(),
  role: z.string().min(1, 'Majburiy maydon'),
  position: z.string().optional().nullable(),
  regionId: z.string().optional().nullable(),
  districtId: z.string().optional().nullable(),
});

const userRefinement = (
  data: z.infer<typeof sharedUserFields>,
  ctx: z.RefinementCtx,
) => {
  const isRegionUser = data.role === USER_ROLES.REGION_USER;
  const isDistrictUser = data.role === USER_ROLES.DISTRICT_USER;
  const isStaff = isRegionUser || isDistrictUser;

  if (data.status === USER_STATUSES.ACTIVE && !data.fullName) {
    ctx.addIssue({
      code: 'custom',
      message: 'Kamida 6 ta belgidan iborat boʻlishi kerak',
      path: ['fullName'],
    });
  }

  // regionId required for all staff regardless of status
  if (isStaff && !data.regionId) {
    ctx.addIssue({
      code: 'custom',
      message: 'Viloyatni tanlang',
      path: ['regionId'],
    });
  }

  // districtId required for district user regardless of status
  if (isDistrictUser && !data.districtId) {
    ctx.addIssue({
      code: 'custom',
      message: 'Tumanni tanlang',
      path: ['districtId'],
    });
  }

  // phoneNumber only required for staff when active
  if (isStaff && data.status === USER_STATUSES.ACTIVE) {
    if (!data.phoneNumber || data.phoneNumber.trim().length < 9) {
      ctx.addIssue({
        code: 'custom',
        message: 'Majburiy maydon',
        path: ['phoneNumber'],
      });
    }
  }

  if (isRegionUser && !data.position) {
    ctx.addIssue({
      code: 'custom',
      message: 'Lavozimni tanlang',
      path: ['position'],
    });
  }
};

export const userSchema = sharedUserFields
  .extend({
    username: z.string().optional(),
    password: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    userRefinement(data, ctx);

    if (data.status === USER_STATUSES.ACTIVE) {
      if (!data.username || data.username.trim().length < 1) {
        ctx.addIssue({ code: 'custom', message: 'Majburiy maydon', path: ['username'] });
      }
      if (!data.password || data.password.trim().length < 6) {
        ctx.addIssue({
          code: 'custom',
          message: 'Parol kamida 6 ta belgidan iborat boʻlishi kerak',
          path: ['password'],
        });
      }
    }
  });

export const updateUserSchema = sharedUserFields.superRefine(userRefinement);

export type UserFormValues = z.infer<typeof userSchema>;
export type UpdateUserFormValues = z.infer<typeof updateUserSchema>;
