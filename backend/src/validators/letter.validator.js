import { z } from "zod";

export const createLetterSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(120, "Title must contain at most 120 characters"),

  content: z
    .string()
    .min(1, "Letter content is required")
    .max(10000, "Letter content is too long"),

  fontFamily: z.string().max(80).optional(),
  textColor: z.string().max(30).optional(),
  backgroundColor: z.string().max(30).optional(),
  theme: z.string().max(60).optional(),
  decoration: z.string().max(60).optional(),

  isOpenOnce: z.boolean().optional(),
  expiresAt: z.string().datetime().optional().nullable(),
});

export const updateLetterSchema = createLetterSchema.partial();

export const unlockLetterSchema = z.object({
  code: z
    .string()
    .min(4, "Access code is required")
    .max(50, "Access code is too long"),
});