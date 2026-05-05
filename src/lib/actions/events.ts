"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSession } from "../auth/server";
import { prisma } from "../prisma";
import { RsvpStatus } from "@/app/generated/prisma/enums";
import { countByStatus } from "@/lib/count-by-status";

// ------ helpers (unchanged) ------
const parseCreateEvent = (formData: FormData) => {
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

const parseEventFields = parseCreateEvent;

const RSVP_STATUSES = ["going", "maybe", "not_going"] as const;

const isRsvpStatus = (s: string): s is RsvpStatus => {
  return (RSVP_STATUSES as readonly string[]).includes(s);
};

const parseRsvp = (formData: FormData) => {
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

// ------ Revalidated actions ------

export const createEventAction = async (formData: FormData) => {
  const session = await getSession();
  if (!session.data) {
    throw new Error("Not authenticated.");
  }
  const userId = session.data.user.id;
  const input = parseEventFields(formData);

  const created = await prisma.event.create({
    data: {
      ownerUserId: userId,
      title: input.title,
      description: input.description,
      location: input.location,
      eventDate: input.eventDate ? new Date(input.eventDate) : null,
    },
  });

  // Revalidate the dashboard (list of events) so the new card appears
  revalidatePath("/events");
  // Also revalidate any layout that shows event counts, if applicable
  revalidatePath("/", "layout");

  return { id: created.id };
};

export const updateEventAction = async (
  eventId: string,
  formData: FormData,
) => {
  const session = await getSession();
  if (!session.data) {
    throw new Error("Not authenticated.");
  }
  const userId = session.data.user.id;

  const owns = await prisma.event.findFirst({
    where: { id: eventId, ownerUserId: userId },
    select: { id: true },
  });

  if (!owns) {
    throw new Error("Event not found.");
  }

  const input = parseEventFields(formData);

  await prisma.event.update({
    where: { id: eventId },
    data: {
      title: input.title,
      description: input.description,
      location: input.location,
      eventDate: input.eventDate ? new Date(input.eventDate) : null,
    },
  });

  // Revalidate both the event detail page and the dashboard
  revalidatePath(`/events/${eventId}`);
  revalidatePath("/events");
};

export const createInviteLinkAction = async (eventId: string) => {
  const session = await getSession();
  if (!session.data) {
    throw new Error("Not authenticated.");
  }
  const userId = session.data.user.id;

  const owns = await prisma.event.findFirst({
    where: { id: eventId, ownerUserId: userId },
    select: { id: true },
  });

  if (!owns) {
    throw new Error("Event not found.");
  }

  const token = crypto.randomUUID().replace(/-/g, "");

  await prisma.eventInvite.upsert({
    where: { eventId },
    create: { eventId, token },
    update: { token },
  });

  // The invite token is part of the event detail – revalidate that page
  revalidatePath(`/events/${eventId}`);
};

export const submitOrUpdateRsvpAction = async (
  token: string,
  formData: FormData,
) => {
  const input = parseRsvp(formData);

  const invite = await prisma.eventInvite.findFirst({
    where: { token },
    select: {
      id: true,
      event: {
        select: { id: true },
      },
    },
  });

  if (!invite) {
    throw new Error("Invite link is invalid.");
  }

  const eventId = invite.event.id;
  const emailNormalized = input.email.toLowerCase();

  await prisma.eventRsvp.upsert({
    where: {
      eventId_emailNormalized: {
        eventId,
        emailNormalized,
      },
    },
    create: {
      eventId,
      inviteId: invite.id,
      name: input.name,
      email: input.email,
      emailNormalized,
      status: input.status as RsvpStatus,
    },
    update: {
      name: input.name,
      status: input.status as RsvpStatus,
      respondedAt: new Date(),
    },
  });

  // The redirect already triggers a fresh render of the invite page
  redirect(`/invite/${token}?submitted=1`);
};

export const deleteEventAction = async (eventId: string) => {
  const session = await getSession();
  if (!session.data) {
    throw new Error("Not authenticated.");
  }
  const userId = session.data.user.id;

  const owns = await prisma.event.findFirst({
    where: { id: eventId, ownerUserId: userId },
    select: { id: true },
  });

  if (!owns) {
    throw new Error("Event not found.");
  }

  await prisma.event.delete({
    where: { id: eventId },
  });

  // Revalidate the dashboard so the deleted event disappears
  revalidatePath("/events");
  // If the user might be looking at the deleted event’s page, revalidate that too
  revalidatePath(`/events/${eventId}`);
};

export const getDashboardEvents = async (userId: string) => {
  const rows = await prisma.event.findMany({
    where: { ownerUserId: userId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      eventDate: true,
      location: true,
      rsvps: { select: { status: true } },
    },
  });

  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    eventDate: row.eventDate ? row.eventDate.toISOString() : null,
    location: row.location,
    ...countByStatus(row.rsvps),
  }));
};

export const getEventDetail = async (eventId: string) => {
  const session = await getSession();

  if (!session.data) {
    throw new Error("Not authenticated.");
  }

  const userId = session.data.user.id;

  const event = await prisma.event.findFirst({
    where: {
      id: eventId,
      ownerUserId: userId,
    },
    select: {
      id: true,
      title: true,
      description: true,
      location: true,
      eventDate: true,
      invite: {
        select: {
          token: true,
        },
      },
      rsvps: {
        orderBy: {
          respondedAt: "desc",
        },
        select: {
          id: true,
          name: true,
          email: true,
          status: true,
          respondedAt: true,
        },
      },
    },
  });

  if (!event) {
    throw new Error("Event not found.");
  }

  const counts = countByStatus(event.rsvps);

  return {
    id: event.id,
    title: event.title,
    description: event.description,
    location: event.location,
    eventDate: event.eventDate ? event.eventDate.toISOString() : null,
    inviteToken: event.invite?.token ?? null,
    rsvps: event.rsvps.map((rsvp) => ({
      ...rsvp,
      respondedAt: rsvp.respondedAt.toISOString(),
    })),
    ...counts,
  };
};
