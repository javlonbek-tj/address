import { z } from 'zod';
import type { Geometry } from 'geojson';
import { PROPERTY_TYPES } from '../constants';

const commonFields = {
  cadNumber: z.string().trim().nullable().optional(),
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
  type: z.string().trim().min(1, 'Majburiy maydon'),
  districtId: z.string().trim().min(1, 'Majburiy maydon'),
  regionId: z.string().trim().optional(),
  mahallaId: z.string().trim().min(1, 'Majburiy maydon'),
  newHouseNumber: z.string().trim().min(1, 'Majburiy maydon'),
};

export const createPropertySchema = z.object({
  ...commonFields,
  streetId: z.string().trim().min(1, 'Majburiy maydon'),
  geometry: z
    .custom<Geometry>()
    .refine((val) => !!val, 'Geometriya talab qilinadi'),
});

export const updatePropertySchema = z.object({
  ...commonFields,
  streetId: z.string().trim().min(1, 'Majburiy maydon'),
});

export type UpdatePropertySchemaType = z.infer<typeof updatePropertySchema>;
export type CreatePropertySchemaType = z.infer<typeof createPropertySchema>;
export { PROPERTY_TYPES };
