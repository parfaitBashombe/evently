import { z } from "zod";

export const commentSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters.")
    .max(80, "Name must be under 80 characters."),
  content: z
    .string()
    .min(1, "Comment cannot be empty.")
    .max(1000, "Comment must be under 1000 characters."),
});
