import { z } from "zod";

const styleConfigSchema = z
  .object({
    envelope: z
      .object({
        style: z.string().optional(),
        color: z.string().optional(),
        seal: z.string().optional(),
      })
      .optional(),

    paper: z
      .object({
        style: z.string().optional(),
        backgroundColor: z.string().optional(),
        borderStyle: z.string().optional(),
      })
      .optional(),

    typography: z
      .object({
        titleFont: z.string().optional(),
        bodyFont: z.string().optional(),
        accentFont: z.string().optional(),
        textColor: z.string().optional(),
      })
      .optional(),

    theme: z
      .object({
        id: z.string().optional(),
      })
      .optional(),

    decorations: z
      .object({
        flowers: z.array(z.string()).optional(),
        icons: z.array(z.string()).optional(),
        accent: z.string().optional(),
      })
      .optional(),
  })
  .optional();

export const createLetterSchema = z.object({
  title: z.string().max(120).optional().nullable(),

  recipientName: z.string().max(25).optional().nullable(),
  senderName: z.string().max(25).optional().nullable(),
  isAnonymous: z.boolean().optional(),

  content: z
    .string()
    .min(1, "Letter content is required")
    .max(10000, "Letter content is too long"),

  styleConfig: styleConfigSchema,

  isOpenOnce: z.boolean().optional(),
  expiresAt: z.string().datetime().optional().nullable(),
});

export const updateLetterSchema = createLetterSchema.partial();