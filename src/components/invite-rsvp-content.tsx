import { Button } from "./ui/button";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { notFound } from "next/navigation";
import { InviteRsvpForm } from "./invite-rsvp-form";

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

  // Removed action binding

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
          <InviteRsvpForm token={token} initialSubmitted={submitted} />
        </CardContent>
      </Card>
    </div>
  );
};
