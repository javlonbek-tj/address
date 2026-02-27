import { z } from 'zod';

export const propertySchema = z.object({
  newCadNumber: z
    .string()
    .trim()
    .min(1, 'Majburiy maydon')
    .regex(
      /^(\d{2}:\d{2}:\d{2}:\d{2}:\d{2}:\d{4})(\/\d{4})?$/,
      'Noto‘g‘ri kadastr raqami formati',
    ),
  type: z.string().trim().min(1, 'Majburiy maydon'),
  streetId: z.string().trim().min(1, 'Majburiy maydon'),
  newHouseNumber: z.string().trim().min(1, 'Majburiy maydon'),
});

export type PropertySchemaType = z.infer<typeof propertySchema>;
