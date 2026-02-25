import { z } from 'zod';

export const propertySchema = z.object({
  newCadNumber: z
    .string()
    .trim()
    .regex(/^\d+:\d+:\d+:\d+:\d+$/, 'Noto‘g‘ri kadastr raqami formati')
    .nullable()
    .optional(),
  type: z.string().trim().min(1, 'Majburiy maydon').optional(),
  streetId: z.string().trim().nullable().optional(),
});

export type PropertySchemaType = z.infer<typeof propertySchema>;
