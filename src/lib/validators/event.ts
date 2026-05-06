import { z } from "zod";

export const eventSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be between 3 and 120 characters.")
    .max(120, "Title must be between 3 and 120 characters."),
  description: z
    .string()
    .optional()
    .transform((v) => (v?.trim() ? v.trim().slice(0, 2000) : null)),
  location: z
    .string()
    .optional()
    .transform((v) => (v?.trim() ? v.trim().slice(0, 200) : null)),
  eventDate: z
    .string()
    .optional()
    .transform((v) => (v?.trim() ? v.trim() : null)),
});
