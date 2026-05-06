import { RsvpStatus } from "@/app/generated/prisma/enums";

export const parseEventFields = (formData: FormData) => {
  const title = String(formData.get("title") ?? "").trim();
  if (title.length < 3 || title.length > 120) {
    throw new Error("Title must be between 3 and 120 characters.");
  }
  const description = String(formData.get("description") ?? "").trim();
  const location = String(formData.get("location") ?? "").trim();
  const eventDate = String(formData.get("eventDate") ?? "").trim();
  return {
    title,
    description: description.length ? description.slice(0, 2000) : null,
    location: location.length ? location.slice(0, 200) : null,
    eventDate: eventDate.length ? eventDate : null,
  };
};

const RSVP_STATUSES = ["going", "maybe", "not_going"] as const;

export const isRsvpStatus = (s: string): s is RsvpStatus => {
  return (RSVP_STATUSES as readonly string[]).includes(s);
};

export const parseRsvp = (formData: FormData) => {
  const name = String(formData.get("name") ?? "").trim();
  if (name.length < 2 || name.length > 120) {
    throw new Error("Name must be between 2 and 120 characters.");
  }
  const email = String(formData.get("email") ?? "").trim();
  if (email.length < 3 || email.length > 320 || !email.includes("@")) {
    throw new Error("Please enter a valid email.");
  }
  const status = String(formData.get("status") ?? "").trim();
  if (!isRsvpStatus(status)) {
    throw new Error("Invalid RSVP status.");
  }
  return { name, email, status };
};
