import { RsvpStatus } from "@/app/generated/prisma/enums";
import { eventSchema } from "./validators/event";
import { rsvpSchema } from "./validators/rsvp";

export const parseEventFields = (formData: FormData) => {
  const data = Object.fromEntries(formData.entries());
  const result = eventSchema.safeParse(data);
  if (!result.success) {
    const flatErrors = result.error.flatten();
    const firstError = flatErrors.formErrors[0] || Object.values(flatErrors.fieldErrors)[0]?.[0];
    throw new Error(firstError || "Validation failed");
  }
  return result.data;
};

const RSVP_STATUSES = ["going", "maybe", "not_going"] as const;

export const isRsvpStatus = (s: string): s is RsvpStatus => {
  return (RSVP_STATUSES as readonly string[]).includes(s);
};

export const parseRsvp = (formData: FormData) => {
  const data = Object.fromEntries(formData.entries());
  const result = rsvpSchema.safeParse(data);
  if (!result.success) {
    const flatErrors = result.error.flatten();
    const firstError = flatErrors.formErrors[0] || Object.values(flatErrors.fieldErrors)[0]?.[0];
    throw new Error(firstError || "Validation failed");
  }
  return result.data;
};
