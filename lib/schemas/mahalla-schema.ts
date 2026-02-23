import { z } from 'zod';

export const mahallaSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, 'Majburiy maydon')
      .max(255, 'Maksimal 255 ta belgi')
      .transform((val) => val.toLowerCase())
      .transform((val) => val.charAt(0).toUpperCase() + val.slice(1)),

    code: z
      .string()
      .trim()
      .regex(/^\d+$/, 'Faqat raqam kiriting')
      .min(1, 'Majburiy maydon')
      .max(12, 'Maksimal 12 ta raqam'),

    uzKadName: z
      .string()
      .trim()
      .min(1, 'Majburiy maydon')
      .max(255, 'Maksimal 255 ta belgi')
      .transform((val) => val.toLowerCase())
      .transform((val) => val.charAt(0).toUpperCase() + val.slice(1)),

    geoCode: z
      .string()
      .trim()
      .regex(/^\d+$/, 'Faqat raqam kiriting')
      .min(1, 'Majburiy maydon')
      .max(12, 'Maksimal 12 ta raqam'),

    oneId: z
      .string()
      .trim()
      .regex(/^\d+$/, 'Faqat raqam kiriting')
      .min(1, 'Majburiy maydon')
      .max(12, 'Maksimal 12 ta raqam'),

    regionId: z.string().trim().min(1, 'Majburiy maydon'),
    districtId: z.string().trim().min(1, 'Majburiy maydon'),

    hidden: z.boolean().default(false),
    mergedIntoId: z.string().trim().nullable().optional(),
    mergedIntoName: z.string().trim().nullable().optional(),
    oldName: z.string().trim().nullable().optional(),
    regulation: z.string().trim().nullable().optional(),
    regulationUrl: z
      .string()
      .trim()
      .min(1, 'Majburiy maydon')
      .refine((val) => !val || /\.pdf$/i.test(val), 'PDF fayl yuklang')
      .nullable()
      .optional(),
  })
  .superRefine((data, ctx) => {
    if (!data.hidden) return;

    if (!data.mergedIntoId) {
      ctx.addIssue({
        code: 'custom',
        message: 'Majburiy maydon',
        path: ['mergedIntoId'],
      });
    }

    if (!data.mergedIntoName) {
      ctx.addIssue({
        code: 'custom',
        message: 'Majburiy maydon',
        path: ['mergedIntoName'],
      });
    }

    if (!data.regulationUrl) {
      ctx.addIssue({
        code: 'custom',
        message: 'Majburiy maydon',
        path: ['regulationUrl'],
      });
    }
  });

export type MahallaSchemaType = z.infer<typeof mahallaSchema>;
