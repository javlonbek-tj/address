import { z } from 'zod';

export const streetSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Majburiy maydon')
    .max(255, 'Maksimal 255 ta belgi'),
  code: z
    .string()
    .trim()
    .min(1, 'Majburiy maydon')
    .max(50, 'Maksimal 50 ta belgi'),
  type: z.string().trim().min(1, 'Majburiy maydon'),
  uzKadCode: z.string().trim().nullable().optional(),
  mahallas: z
    .array(
      z.object({
        mahallaCode: z.string().trim().min(1, 'Majburiy maydon'),
        name: z.string().trim().optional(),
      }),
    )
    .min(1, 'Kamida bitta mahalla tanlanishi kerak'),
  regionId: z.string().optional(),
  districtId: z.string().optional(),
});

export type StreetSchemaType = z.infer<typeof streetSchema>;
