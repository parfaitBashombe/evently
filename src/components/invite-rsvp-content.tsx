"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { notFound } from "next/navigation";
import { InviteRsvpForm } from "./invite-rsvp-form";
import { Loader2 } from "lucide-react";

interface EventData {
  title: string;
  description: string | null;
  location: string | null;
  eventDate: string | null;
}

export const InviteRsvpContent = ({
  token,
  submitted,
}: {
  token: string;
  submitted: boolean;
}) => {
  const [event, setEvent] = useState<EventData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await fetch(`/api/invite/${token}`);
        if (!response.ok) {
          setError(true);
          return;
        }
        const data = await response.json();
        setEvent(data.event);
      } catch (err) {
        console.error(err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [token]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-violet-400" />
      </div>
    );
  }

  if (error || !event) {
    notFound();
  }

  return (
    <div className="mx-auto w-full max-w-2xl">
      <Card
        className="overflow-hidden relative"
        style={{
          background: "linear-gradient(160deg, #1a0f2e 0%, #16161f 100%)",
          border: "1px solid rgba(149,95,255,0.2)",
        }}
      >
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 h-px rounded-t-lg"
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, #955fff 40%, #c084fc 60%, transparent 100%)",
            opacity: 0.6,
          }}
        />
        <CardHeader className="space-y-3">
          <Badge variant="secondary" className="w-fit">
            RSVP
          </Badge>
          <CardTitle
            className="text-xl font-bold tracking-tight"
            style={{
              background: "linear-gradient(135deg, #ffffff 30%, #c084fc 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            {event.title}
          </CardTitle>
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
