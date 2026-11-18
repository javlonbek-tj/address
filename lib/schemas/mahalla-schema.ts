import { z } from 'zod';

const position = z
  .array(z.number())
  .min(2)
  .refine(([lng, lat]) => Math.abs(lng) <= 180 && Math.abs(lat) <= 90, {
    message: 'Koordinatalar WGS84 formatida emas',
  });
const ring = z.array(position).min(4);
const polygonCoordinates = z.array(ring).min(1);

const boundaryGeometrySchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('Polygon'), coordinates: polygonCoordinates }),
  z.object({
    type: z.literal('MultiPolygon'),
    coordinates: z.array(polygonCoordinates).min(1),
  }),
]);

export const mahallaSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, 'Majburiy maydon')
      .max(255, 'Maksimal 255 ta belgi')
      .transform((val) =>
        val
          .split(/\s+/)
          .map((word) => {
            if (word.length > 1 && word === word.toUpperCase() && /[A-Z]/.test(word)) {
              return word;
            }
            const lower = word.toLowerCase();
            return lower.charAt(0).toUpperCase() + lower.slice(1);
          })
          .join(' '),
      ),

    code: z
      .string()
      .trim()
      .regex(/^\d+$/, 'Faqat raqam kiriting')
      .min(1, 'Majburiy maydon')
      .max(12, 'Maksimal 12 ta raqam'),

    uzKadName: z
      .string()
      .trim()
      .min(1, 'Majburiy maydon')
      .max(255, 'Maksimal 255 ta belgi')
      .transform((val) =>
        val
          .split(/\s+/)
          .map((word) => {
            if (word.length > 1 && word === word.toUpperCase() && /[A-Z]/.test(word)) {
              return word;
            }
            const lower = word.toLowerCase();
            return lower.charAt(0).toUpperCase() + lower.slice(1);
          })
          .join(' '),
      ),

    geoCode: z
      .string()
      .trim()
      .regex(/^\d+$/, 'Faqat raqam kiriting')
      .min(1, 'Majburiy maydon')
      .max(12, 'Maksimal 12 ta raqam'),

    oneId: z
      .string()
      .trim()
      .regex(/^\d+$/, 'Faqat raqam kiriting')
      .min(1, 'Majburiy maydon')
      .max(12, 'Maksimal 12 ta raqam'),

    regionId: z.string().trim().min(1, 'Majburiy maydon'),
    districtId: z.string().trim().min(1, 'Majburiy maydon'),

    mergedInto: z.array(
      z.object({
        mahallaCode: z.string().trim().min(1, 'Majburiy maydon'),
        name: z.string().trim(),
      }),
    ),
    oldName: z.string().trim().nullable().optional(),
    regulation: z.string().trim().nullable().optional(),
    regulationUrl: z
      .string()
      .trim()
      .min(1, 'Majburiy maydon')
      .nullable()
      .optional(),

    isOptimized: z.boolean(),
    geometry: boundaryGeometrySchema.optional(),
    mergingMahallas: z.array(
      z.object({
        mahallaCode: z.string().trim().min(1, 'Majburiy maydon'),
        name: z.string().trim(),
      }),
    ),
  })
  .superRefine((data, ctx) => {
    if (!data.isOptimized) return;

    if (!data.regulationUrl) {
      ctx.addIssue({
        code: 'custom',
        message: 'Majburiy maydon',
        path: ['regulationUrl'],
      });
    }

    if (!data.mergedInto.length) {
      ctx.addIssue({
        code: 'custom',
        message: 'Majburiy maydon',
        path: ['mergedInto'],
      });
    }
  });

export type MahallaSchemaType = z.infer<typeof mahallaSchema>;
