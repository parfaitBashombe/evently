/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EditEventModal } from "@/components/edit-event-modal";
import {
  CalendarDays,
  MapPin,
  CheckCircle2,
  HelpCircle,
  XCircle,
  Link2,
  Users,
  Copy,
  Loader2,
} from "lucide-react";
import { RsvpStatus } from "@/app/generated/prisma/client";

interface EventDetailModalProps {
  eventId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEventUpdated?: () => void;
}

// Represents the RSVP data as returned by the API (with serialized dates)
interface RsvpItem {
  id: string;
  name: string;
  email: string;
  status: RsvpStatus;
  respondedAt: string;
}

interface EventDetail {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  eventDate: string | null; // always a string (ISO) after fetch
  inviteToken: string | null;
  goingCount: number;
  maybeCount: number;
  notGoingCount: number;
  rsvps: RsvpItem[];
}

const RSVP_STATUS_CONFIG = {
  going: {
    label: "Going",
    icon: CheckCircle2,
    style: {
      background: "rgba(52,211,153,0.12)",
      color: "#34d399",
    },
  },
  maybe: {
    label: "Maybe",
    icon: HelpCircle,
    style: {
      background: "rgba(251,191,36,0.12)",
      color: "#fbbf24",
    },
  },
  not_going: {
    label: "Not Going",
    icon: XCircle,
    style: {
      background: "rgba(248,113,113,0.12)",
      color: "#f87171",
    },
  },
} as const;

export const EventDetailModal = ({
  eventId,
  open,
  onOpenChange,
  onEventUpdated,
}: EventDetailModalProps) => {
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);

  const fetchEvent = async (silent = false) => {
    if (!eventId) return;
    if (!silent) setLoading(true);
    try {
      const response = await fetch(`/api/events/${eventId}`);
      if (!response.ok) throw new Error("Failed to fetch event detail");
      const data = await response.json();
      if (data) {
        data.eventDate = data.eventDate
          ? new Date(data.eventDate).toISOString()
          : null;
      }
      setEvent(data);
    } catch (error) {
      console.error(error);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    if (open && eventId) {
      fetchEvent();
    }
  }, [open, eventId]);

  const handleAfterMutation = async () => {
    await fetchEvent(true);
    onEventUpdated?.();
  };

  if (!eventId) return null;

  const handleCreateInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGeneratingLink(true);
    try {
      const response = await fetch(`/api/events/${eventId}/invite`, { method: "POST" });
      if (!response.ok) throw new Error("Failed to create invite");
      await fetchEvent(true);
    } catch (error) {
      console.error(error);
    } finally {
      setIsGeneratingLink(false);
    }
  };

  const baseUrl = typeof window !== "undefined" ? window.location.origin : process.env.NEXT_PUBLIC_APP_URL ?? "";
  const inviteUrl = event?.inviteToken
    ? `${baseUrl}/invite/${event.inviteToken}`
    : null;

  const total = event
    ? event.goingCount + event.maybeCount + event.notGoingCount
    : 0;

  // Prevent "event.goingCount is possibly null" by using optional chaining
  const goingPct = total > 0 ? ((event?.goingCount ?? 0) / total) * 100 : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-2xl max-h-[90vh] overflow-y-auto"
        style={{
          background: "linear-gradient(160deg, #1a0f2e 0%, #16161f 100%)",
          border: "1px solid rgba(149,95,255,0.2)",
        }}
      >
        <DialogTitle className="sr-only">
          {event?.title ? `Event Details: ${event.title}` : "Event Details"}
        </DialogTitle>
        {loading || !event ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-violet-400" />
          </div>
        ) : (
          <div className="flex flex-col gap-10">
            {/* ── Page header ── */}
            <div className="relative flex flex-wrap items-end justify-between gap-4">
              <div className="flex flex-col gap-1">
                <Badge variant="secondary" className="w-fit mb-1">
                  Event Details
                </Badge>
                <h2 className="text-xl font-bold font-heading">
                  {event.title}
                </h2>

                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                  {event.eventDate && (
                    <span className="flex items-center gap-1.5">
                      <CalendarDays className="h-3.5 w-3.5 text-violet-400" />
                      {new Date(event.eventDate).toLocaleString(undefined, {
                        weekday: "short",
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  )}
                  {event.location && (
                    <span className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-violet-400" />
                      {event.location}
                    </span>
                  )}
                  {!event.eventDate && !event.location && (
                    <span className="italic opacity-50 text-xs">
                      No date or location set
                    </span>
                  )}
                </div>

                {event.description && (
                  <p className="max-w-2xl text-sm text-muted-foreground mt-1">
                    {event.description}
                  </p>
                )}
              </div>

              <EditEventModal event={event} onSuccess={handleAfterMutation} />
            </div>

            {/* ── Stats bar ── */}
            <section
              className="rounded-2xl px-6 py-6"
              style={{
                background: "rgba(149,95,255,0.06)",
                border: "1px solid rgba(149,95,255,0.15)",
              }}
            >
              <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
                {[
                  { value: total, label: "Total responses" },
                  { value: event.goingCount, label: "Going" },
                  { value: event.maybeCount, label: "Maybe" },
                  { value: event.notGoingCount, label: "Not going" },
                ].map(({ value, label }) => (
                  <div
                    key={label}
                    className="flex flex-col items-center gap-1 text-center"
                  >
                    <span
                      className="text-3xl font-black tracking-tight"
                      style={{
                        background: "linear-gradient(135deg, #955fff, #c084fc)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                      }}
                    >
                      {value}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {label}
                    </span>
                  </div>
                ))}
              </div>

              {total > 0 && (
                <div className="mt-4 flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" /> {total} response
                      {total !== 1 ? "s" : ""}
                    </span>
                    <span>{Math.round(goingPct)}% going</span>
                  </div>
                  <div
                    className="h-2 w-full overflow-hidden rounded-full"
                    style={{ background: "rgba(255,255,255,0.07)" }}
                  >
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${goingPct}%`,
                        background: "linear-gradient(90deg, #955fff, #34d399)",
                      }}
                    />
                  </div>
                </div>
              )}
            </section>

            {/* ── RSVP pills ── */}
            <div className="flex flex-wrap gap-2">
              <span
                className="flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium"
                style={{
                  background: "rgba(52,211,153,0.12)",
                  color: "#34d399",
                }}
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                {event.goingCount} Going
              </span>

              <span
                className="flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium"
                style={{
                  background: "rgba(251,191,36,0.12)",
                  color: "#fbbf24",
                }}
              >
                <HelpCircle className="h-3.5 w-3.5" />
                {event.maybeCount} Maybe
              </span>

              <span
                className="flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium"
                style={{
                  background: "rgba(248,113,113,0.12)",
                  color: "#f87171",
                }}
              >
                <XCircle className="h-3.5 w-3.5" />
                {event.notGoingCount} Not going
              </span>
            </div>

            {/* ── Invite Link card ── */}
            <div
              className="overflow-hidden rounded-2xl p-6"
              style={{
                background: "rgba(149,95,255,0.04)",
                border: "1px solid rgba(149,95,255,0.15)",
              }}
            >
              <h3 className="flex items-center gap-2 text-sm font-medium mb-3">
                <Link2 className="h-4 w-4 text-violet-400" />
                Invite Link
              </h3>

              <p className="text-sm text-muted-foreground mb-3">
                Share this link with guests so they can RSVP without creating an
                account.
              </p>

              {inviteUrl ? (
                <div
                  className="flex items-center justify-between gap-3 rounded-xl px-4 py-3 text-sm font-mono mb-3"
                  style={{
                    background: "rgba(149,95,255,0.06)",
                    border: "1px solid rgba(149,95,255,0.15)",
                  }}
                >
                  <span className="truncate text-violet-300">{inviteUrl}</span>

                  <Button
                    size="icon"
                    variant="ghost"
                    className="shrink-0 h-7 w-7 text-muted-foreground hover:text-violet-400"
                    onClick={() => navigator.clipboard.writeText(inviteUrl)}
                    title="Copy link"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic mb-3">
                  No invite link generated yet.
                </p>
              )}

              <form onSubmit={handleCreateInvite}>
                <Button type="submit" size="sm" disabled={isGeneratingLink}>
                  {isGeneratingLink && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {inviteUrl ? "Regenerate Link" : "Generate Link"}
                </Button>
              </form>
            </div>

            {/* ── Attendees card ── */}
            <div
              className="overflow-hidden rounded-2xl p-6"
              style={{
                background: "rgba(149,95,255,0.04)",
                border: "1px solid rgba(149,95,255,0.15)",
              }}
            >
              <h3 className="flex items-center gap-2 text-sm font-medium mb-3">
                <Users className="h-4 w-4 text-violet-400" />
                Attendees
                {event.rsvps?.length > 0 && (
                  <span
                    className="ml-1 rounded-full px-2 py-0.5 text-xs font-medium"
                    style={{
                      background: "rgba(149,95,255,0.15)",
                      color: "#c084fc",
                    }}
                  >
                    {event.rsvps.length}
                  </span>
                )}
              </h3>

              {event.rsvps?.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-8 text-center">
                  <span
                    className="flex h-10 w-10 items-center justify-center rounded-xl"
                    style={{ background: "rgba(149,95,255,0.1)" }}
                  >
                    <Users className="h-5 w-5 text-violet-400 opacity-60" />
                  </span>
                  <p className="text-sm text-muted-foreground">
                    No responses yet.
                  </p>
                  <p className="text-xs text-muted-foreground opacity-60">
                    Share the invite link above to start collecting RSVPs.
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Updated</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {event.rsvps.map((rsvp) => {
                      const config = RSVP_STATUS_CONFIG[
                        rsvp.status as keyof typeof RSVP_STATUS_CONFIG
                      ] ?? {
                        label: rsvp.status,
                        icon: HelpCircle,
                        style: {},
                      };

                      const StatusIcon = config.icon;

                      return (
                        <TableRow key={rsvp.id}>
                          <TableCell className="font-medium">
                            {rsvp.name}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {rsvp.email}
                          </TableCell>
                          <TableCell>
                            <span
                              className="flex w-fit items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium"
                              style={config.style}
                            >
                              <StatusIcon className="h-3 w-3" />
                              {config.label}
                            </span>
                          </TableCell>
                          <TableCell className="text-muted-foreground text-sm">
                            {new Date(rsvp.respondedAt).toLocaleDateString(
                              undefined,
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              },
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
