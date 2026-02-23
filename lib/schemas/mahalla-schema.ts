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
      .nullable()
      .optional(),

    isOptimized: z.boolean().default(false),
    mergingMahallas: z
      .array(
        z.object({
          id: z.string().trim().min(1, 'Majburiy maydon'),
          name: z.string().trim(),
        }),
      )
      .optional()
      .default([]),
  })
  .superRefine((data, ctx) => {
    if (!data.isOptimized) return;

    if (!data.regulationUrl) {
      ctx.addIssue({
        code: 'custom',
        message: 'Majburiy maydon',
        path: ['regulationUrl'],
      });
    }
  });

export type MahallaSchemaType = z.infer<typeof mahallaSchema>;
