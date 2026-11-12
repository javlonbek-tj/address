import { z } from 'zod';

// Canonical form only: no leading zeros, uppercase letter suffix or "/n" building suffix.
// Values are never converted (e.g. "05" or "2a" are rejected, not rewritten).
export const HOUSE_NUMBER_REGEX = /^[1-9]\d*(?:[A-Z]|\/\d+)?$/;
export const HOUSE_NUMBER_FORMAT_MESSAGE = "Uy raqami noto'g'ri formatda (masalan: 1, 2A, 12/1)";

export const propertyAssignSchema = z.object({
  streetId: z.string().trim().min(1, "Ko'cha tanlanishi kerak"),
  houseNumber: z
    .string()
    .trim()
    .min(1, 'Uy raqami kiritilishi kerak')
    .max(10, 'Maksimal 10 ta belgi')
    .regex(HOUSE_NUMBER_REGEX, HOUSE_NUMBER_FORMAT_MESSAGE),
});

export type PropertyAssignSchemaType = z.infer<typeof propertyAssignSchema>;

export const batchAssignSchema = z.object({
  streetId: z.string().trim().min(1, "Ko'cha tanlanishi kerak"),
  assignments: z
    .array(
      z.object({
        propertyId: z.string().min(1),
        houseNumber: z.number().int().positive(),
      }),
    )
    .min(1, 'Kamida bitta bino belgilanishi kerak')
    .max(1000, "Bir martada ko'pi bilan 1000 ta bino")
    .refine((items) => new Set(items.map((i) => i.propertyId)).size === items.length, 'Takroriy bino')
    .refine((items) => new Set(items.map((i) => i.houseNumber)).size === items.length, 'Takroriy uy raqami'),
});

export type BatchAssignSchemaType = z.infer<typeof batchAssignSchema>;
