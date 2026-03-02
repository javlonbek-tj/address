import { z } from 'zod';

export const propertySchema = z.object({
  cadNumber: z.string().trim().min(1, 'Majburiy maydon'),
  newCadNumber: z
    .string()
    .trim()
    .nullable()
    .optional()
    .refine(
      (val) =>
        !val || /^(\d{2}:\d{2}:\d{2}:\d{2}:\d{2}:\d{4})(\/\d{4})?$/.test(val),
      {
        message: 'Noto‘g‘ri kadastr raqami formati',
      },
    ),
  type: z.string().trim().nullable().optional(),
  regionId: z.string().trim().min(1, 'Majburiy maydon'),
  districtId: z.string().trim().min(1, 'Majburiy maydon'),
  mahallaId: z.string().trim().min(1, 'Majburiy maydon'),
  streetId: z.string().trim().nullable().optional(),
  newHouseNumber: z.string().trim().nullable().optional(),
});

export type PropertySchemaType = z.infer<typeof propertySchema>;
