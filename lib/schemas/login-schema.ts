import z from 'zod';

export const loginSchema = z.object({
  username: z.string().trim().min(1, 'Majburiy maydon'),
  password: z.string().trim().min(1, 'Majburiy maydon'),
});

export type LoginSchemaType = z.infer<typeof loginSchema>;
