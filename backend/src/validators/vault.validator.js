import { z } from "zod";

export const createVaultSchema = z.object({
  name: z
    .string()
    .min(1, "Private garden name is required")
    .max(80, "Name must contain at most 80 characters"),

  description: z
    .string()
    .max(300, "Description must contain at most 300 characters")
    .optional()
    .nullable(),
});

export const updateVaultSchema = createVaultSchema.partial();

export const unlockVaultSchema = z.object({
  code: z
    .string()
    .min(4, "Access code is required")
    .max(50, "Access code is too long"),
});