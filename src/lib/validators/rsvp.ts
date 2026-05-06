import { z } from "zod";

export const rsvpSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be between 2 and 120 characters.")
    .max(120, "Name must be between 2 and 120 characters."),
  email: z.string().email("Please enter a valid email.").min(3).max(320),
  status: z.enum(["going", "maybe", "not_going"], {
    errorMap: () => ({ message: "Invalid RSVP status." }),
  }),
});
