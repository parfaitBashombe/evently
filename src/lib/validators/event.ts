import { z } from "zod";

export const eventSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be between 3 and 120 characters.")
    .max(120, "Title must be between 3 and 120 characters."),
  content: z
    .string()
    .optional()
    .transform((v) => (v?.trim() ? v.trim() : null)),
  description: z
    .string()
    .optional()
    .transform((v) => (v?.trim() ? v.trim().slice(0, 500) : null)),
  coverImage: z
    .string()
    .optional()
    .transform((v) => (v?.trim() ? v.trim() : null)),
  location: z
    .string()
    .optional()
    .transform((v) => (v?.trim() ? v.trim().slice(0, 200) : null)),
  category: z
    .string()
    .optional()
    .transform((v) => (v?.trim() ? v.trim() : null)),
  capacity: z
    .union([z.string(), z.number()])
    .optional()
    .transform((v) => {
      if (typeof v === "number") return v > 0 ? v : null;
      const n = parseInt(String(v ?? ""), 10);
      return !isNaN(n) && n > 0 ? n : null;
    }),
  status: z
    .enum(["draft", "published", "cancelled"])
    .optional()
    .default("draft"),
  isPublic: z
    .union([z.boolean(), z.string()])
    .optional()
    .transform((v) => {
      if (typeof v === "boolean") return v;
      return v === "true";
    })
    .default(false),
  eventDate: z
    .string()
    .optional()
    .transform((v) => (v?.trim() ? v.trim() : null)),
  endDate: z
    .string()
    .optional()
    .transform((v) => (v?.trim() ? v.trim() : null)),
});
