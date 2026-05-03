import { Button } from "./ui/button";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { notFound } from "next/navigation";
import { Field, FieldLabel, FieldDescription } from "./ui/field";
import { Input } from "./ui/input";
import { submitOrUpdateRsvpAction } from "@/lib/actions/events";

export const InviteRsvpContent = async ({
  token,
  submitted,
}: {
  token: string;
  submitted: boolean;
}) => {
  const row = await prisma.eventInvite.findFirst({
    where: { token },
    include: {
      event: {
        select: {
          id: true,
          title: true,
          description: true,
          location: true,
          eventDate: true,
        },
      },
    },
  });

  if (!row) {
    notFound();
  }

  const eventRow = row.event;
  const event = {
    title: eventRow.title,
    description: eventRow.description,
    location: eventRow.location,
    eventDate: eventRow.eventDate ? eventRow.eventDate.toISOString() : null,
  };

  const submitRsvpForToken = submitOrUpdateRsvpAction.bind(null, token);

  return (
    <div className="mx-auto w-full max-w-2xl">
      <Card>
        <CardHeader className="space-y-3">
          <Badge variant="secondary" className="w-fit">
            RSVP
          </Badge>
          <CardTitle>{event.title}</CardTitle>
          <p className="text-sm text-muted-foreground">
            {event.eventDate
              ? new Date(event.eventDate).toLocaleString()
              : "No date selected"}
            {event.location ? ` - ${event.location}` : ""}
          </p>
          {event.description ? (
            <p className="text-sm text-muted-foreground">{event.description}</p>
          ) : null}
        </CardHeader>
        <CardContent>
          {submitted ? (
            <p className="mb-4 rounded-md border border-(--accent)/50 bg-(--accent)/15 p-3 text-sm text-[#e9dbff]">
              Thanks. Your RSVP has been recorded (or updated).
            </p>
          ) : null}
          <form action={submitRsvpForToken} className="space-y-4">
            <Field>
              <FieldLabel htmlFor="name">Name</FieldLabel>
              <Input
                id="name"
                name="name"
                required
                placeholder="Your name"
                autoComplete="off"
              />
              <FieldDescription>
                Enter the name we should use for your RSVP.
              </FieldDescription>
            </Field>
            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                name="email"
                type="email"
                required
                placeholder="you@example.com"
                autoComplete="off"
              />
              <FieldDescription>
                We&apos;ll use this to confirm your RSVP.
              </FieldDescription>
            </Field>
            <Field>
              <FieldLabel htmlFor="status">Attendance</FieldLabel>
              <select
                id="status"
                name="status"
                required
                defaultValue="going"
                className="flex h-10 w-full rounded-md border border-border bg-(--surface) px-3 py-2 text-sm text-foreground"
              >
                <option value="going">Going</option>
                <option value="maybe">Maybe</option>
                <option value="not_going">Not going</option>
              </select>
              <FieldDescription>
                Let the organiser know if you plan to attend.
              </FieldDescription>
            </Field>
            <Button type="submit">Submit RSVP</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
