import { z } from 'zod';

export const districtSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Majburiy maydon')
    .max(100, 'Tuman nomi 100 belgidan oshmasligi kerak')
    .transform((val) => val.toLowerCase())
    .transform((val) => val.charAt(0).toUpperCase() + val.slice(1)),

  code: z
    .number()
    .min(1, 'Majburiy maydon')
    .max(1000000000, 'Tuman kodi 1,000,000,000 belgidan oshmasligi kerak'),

  regionId: z.string().min(1, 'Hududni tanlash majburiy'),
});

export type DistrictSchemaType = z.infer<typeof districtSchema>;
