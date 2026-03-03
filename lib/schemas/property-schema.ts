import { z } from 'zod';

const basePropertySchema = z.object({
  cadNumber: z.string().trim().nullable().optional(),
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
  type: z.string().trim().min(1, 'Majburiy maydon'),
  districtId: z.string().trim().min(1, 'Majburiy maydon'),
  regionId: z.string().trim().optional(),
  mahallaId: z.string().trim().min(1, 'Majburiy maydon'),
  streetId: z.string().trim().nullable().optional(),
  newHouseNumber: z.string().trim().min(1, 'Majburiy maydon'),
  geometry: z.any().optional(),
});

// For general usage and form defaults
export const propertySchema = basePropertySchema;

// Strict validation for updating properties
export const updatePropertySchema = basePropertySchema.extend({
  newCadNumber: z
    .string()
    .trim()
    .min(1, 'Majburiy maydon')
    .refine(
      (val) => /^(\d{2}:\d{2}:\d{2}:\d{2}:\d{2}:\d{4})(\/\d{4})?$/.test(val),
      {
        message: 'Noto‘g‘ri kadastr raqami formati',
      },
    ),
  streetId: z.string().trim().min(1, 'Majburiy maydon'),
});

// Strict validation for creating properties (drawing)
export const createPropertySchema = basePropertySchema.extend({
  geometry: z.any().refine((val) => !!val, 'Geometriya talab qilinadi'),
  streetId: z.string().trim().min(1, 'Majburiy maydon'),
});

export type PropertySchemaType = z.infer<typeof propertySchema>;
export type UpdatePropertySchemaType = z.infer<typeof updatePropertySchema>;
export type CreatePropertySchemaType = z.infer<typeof createPropertySchema>;
