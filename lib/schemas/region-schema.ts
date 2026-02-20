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
    .number()
    .min(1, 'Majburiy maydon')
    .max(1000000000, 'Hudud kodi 1,000,000,000 belgidan oshmasligi kerak'),
});

export type RegionSchemaType = z.infer<typeof regionSchema>;
