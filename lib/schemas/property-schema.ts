import { z } from 'zod';

// Canonical form only: no leading zeros, lowercase letter suffix or "/n" building suffix.
// Values are never converted (e.g. "05" or "2A" are rejected, not rewritten).
export const HOUSE_NUMBER_REGEX = /^[1-9]\d*(?:[a-z]|\/\d+)?$/;
export const HOUSE_NUMBER_FORMAT_MESSAGE = "Uy raqami noto'g'ri formatda (masalan: 1, 2a, 12/1)";

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

const houseNumberSchema = z.string().regex(HOUSE_NUMBER_REGEX, HOUSE_NUMBER_FORMAT_MESSAGE);

export const batchAssignSchema = z
  .object({
    streetId: z.string().trim().min(1, "Ko'cha tanlanishi kerak"),
    assignments: z
      .array(z.object({ propertyId: z.string().min(1), houseNumber: houseNumberSchema }))
      .max(1000, "Bir martada ko'pi bilan 1000 ta bino")
      .refine((items) => new Set(items.map((i) => i.propertyId)).size === items.length, 'Takroriy bino'),
    // Numbers kept free for empty plots.
    reserved: z.array(houseNumberSchema).max(1000).default([]),
  })
  .refine((data) => data.assignments.length + data.reserved.length > 0, 'Kamida bitta bino belgilanishi kerak')
  .refine((data) => {
    const numbers = [...data.assignments.map((a) => a.houseNumber), ...data.reserved];
    return new Set(numbers).size === numbers.length;
  }, 'Takroriy uy raqami');

export type BatchAssignSchemaType = z.input<typeof batchAssignSchema>;
