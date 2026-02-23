import { z } from 'zod';

export const districtSchema = z.object({
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

  regionId: z.string().min(1, 'Majburiy maydon'),
});

export type DistrictSchemaType = z.infer<typeof districtSchema>;
