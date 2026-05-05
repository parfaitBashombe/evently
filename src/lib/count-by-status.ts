import type { RsvpStatus as PrismaRsvpStatus } from "@/app/generated/prisma/enums";

export const countByStatus = (rsvps: { status: PrismaRsvpStatus }[]) => {
  let goingCount = 0;
  let maybeCount = 0;
  let notGoingCount = 0;

  for (const rsvp of rsvps) {
    if (rsvp.status === "going") goingCount += 1;
    else if (rsvp.status === "maybe") maybeCount += 1;
    else if (rsvp.status === "not_going") notGoingCount += 1;
  }

  return { goingCount, maybeCount, notGoingCount };
};
