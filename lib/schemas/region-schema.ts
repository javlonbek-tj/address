import { z } from 'zod';

export const regionSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Majburiy maydon')
    .max(100, 'Hudud nomi 100 belgidan oshmasligi kerak')
    .transform((val) => val.toLowerCase())
    .transform((val) => val.charAt(0).toUpperCase() + val.slice(1)),

  code: z
    .string()
    .trim()
    .min(1, 'Majburiy maydon')
    .max(12, 'Maksimal 12 ta raqam')
    .regex(/^\d+$/, 'Faqat raqam kiriting'),
});

export type RegionSchemaType = z.infer<typeof regionSchema>;
