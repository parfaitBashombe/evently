"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
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
  RefreshCw,
  X,
} from "lucide-react";
import { RsvpStatus } from "@/app/generated/prisma/client";

interface EventDetailModalProps {
  eventId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEventUpdated?: () => void;
}

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
  content: string | null;
  location: string | null;
  category: string | null;
  coverImage: string | null;
  status: "draft" | "published" | "cancelled";
  isPublic: boolean;
  eventDate: string | null;
  endDate: string | null;
  capacity: number | null;
  inviteToken: string | null;
  goingCount: number;
  maybeCount: number;
  notGoingCount: number;
  rsvps: RsvpItem[];
}

const STATUS_CONFIG = {
  going: {
    label: "Going",
    icon: CheckCircle2,
    badge: "bg-emerald-500/15 border border-emerald-500/25 text-emerald-400",
  },
  maybe: {
    label: "Maybe",
    icon: HelpCircle,
    badge: "bg-amber-500/15 border border-amber-500/25 text-amber-400",
  },
  not_going: {
    label: "Not going",
    icon: XCircle,
    badge: "bg-red-500/15 border border-red-500/25 text-red-400",
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
  const [copied, setCopied] = useState(false);

  const fetchEvent = async (silent = false) => {
    if (!eventId) return;
    if (!silent) setLoading(true);
    try {
      const res = await fetch(`/api/events/${eventId}`);
      if (!res.ok) throw new Error("Failed to fetch event");
      const data = await res.json();
      setEvent({
        ...data,
        eventDate: data.eventDate ? new Date(data.eventDate).toISOString() : null,
        endDate: data.endDate ? new Date(data.endDate).toISOString() : null,
      });
    } catch (error) {
      console.error(error);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    if (open && eventId) fetchEvent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, eventId]);

  const handleAfterMutation = async () => {
    await fetchEvent(true);
    onEventUpdated?.();
  };

  const handleCreateInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGeneratingLink(true);
    try {
      const res = await fetch(`/api/events/${eventId}/invite`, { method: "POST" });
      if (!res.ok) throw new Error("Failed to create invite");
      await fetchEvent(true);
    } catch (error) {
      console.error(error);
    } finally {
      setIsGeneratingLink(false);
    }
  };

  const handleCopy = () => {
    if (!inviteUrl) return;
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  if (!eventId) return null;

  const baseUrl =
    typeof window !== "undefined"
      ? window.location.origin
      : process.env.NEXT_PUBLIC_APP_URL ?? "";

  const inviteUrl = event?.inviteToken
    ? `${baseUrl}/e/${event.inviteToken}`
    : null;

  const total = event
    ? event.goingCount + event.maybeCount + event.notGoingCount
    : 0;
  const goingPct = total > 0 ? ((event?.goingCount ?? 0) / total) * 100 : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto border-white/10 bg-[#0e1528] p-0" showCloseButton={false}>
        <div className="absolute inset-x-0 top-0 h-[2px] rounded-t-2xl bg-gradient-to-r from-transparent via-[#004ac6] to-transparent" />

        <DialogTitle className="sr-only">
          {event?.title ?? "Event Details"}
        </DialogTitle>

        <button
          onClick={() => onOpenChange(false)}
          className="absolute top-4 right-4 z-10 flex h-8 w-8 items-center justify-center rounded-lg text-white/40 transition-colors hover:bg-white/8 hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>

        {loading || !event ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-7 w-7 animate-spin text-[#60a5fa]" />
          </div>
        ) : (
          <div className="flex flex-col gap-0">
            {/* Header */}
            <div className="flex flex-wrap items-start justify-between gap-3 px-6 pt-6 pb-5 border-b border-white/8 pr-14">
              <div className="flex flex-col gap-1.5 min-w-0">
                <h2 className="text-xl font-bold text-white leading-snug">{event.title}</h2>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-white/40">
                  {event.eventDate && (
                    <span className="flex items-center gap-1.5">
                      <CalendarDays className="h-3.5 w-3.5 text-[#60a5fa]" />
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
                      <MapPin className="h-3.5 w-3.5 text-[#60a5fa]" />
                      {event.location}
                    </span>
                  )}
                </div>
                {event.description && (
                  <p className="text-sm text-white/40 mt-0.5 leading-relaxed max-w-lg">
                    {event.description}
                  </p>
                )}
              </div>
              <EditEventModal event={event} onSuccess={handleAfterMutation} />
            </div>

            {/* RSVP stats */}
            <div className="px-6 py-5 border-b border-white/8 flex flex-col gap-4">
              <div className="grid grid-cols-4 gap-3">
                {[
                  { value: total,              label: "Total",     color: "text-white" },
                  { value: event.goingCount,   label: "Going",     color: "text-emerald-400" },
                  { value: event.maybeCount,   label: "Maybe",     color: "text-amber-400" },
                  { value: event.notGoingCount, label: "Not going", color: "text-red-400" },
                ].map(({ value, label, color }) => (
                  <div
                    key={label}
                    className="flex flex-col items-center gap-0.5 rounded-xl border border-white/8 bg-white/5 py-3 text-center"
                  >
                    <span className={`text-2xl font-bold tabular-nums ${color}`}>{value}</span>
                    <span className="text-[11px] text-white/35">{label}</span>
                  </div>
                ))}
              </div>

              {total > 0 && (
                <div className="flex flex-col gap-1.5">
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/8">
                    <div
                      className="h-full rounded-full bg-[#004ac6] transition-all duration-700"
                      style={{ width: `${goingPct}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-white/35 text-right">
                    {Math.round(goingPct)}% going
                  </p>
                </div>
              )}
            </div>

            {/* Invite link */}
            <div className="px-6 py-5 border-b border-white/8 flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <Link2 className="h-4 w-4 text-[#60a5fa]" />
                <span className="text-sm font-bold text-white">Invite link</span>
              </div>

              {inviteUrl ? (
                <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2">
                  <span className="flex-1 truncate font-mono text-xs text-[#60a5fa]">
                    {inviteUrl}
                  </span>
                  <button
                    onClick={handleCopy}
                    className="shrink-0 rounded-md p-1 text-white/40 transition-colors hover:text-white"
                    title="Copy link"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <p className="text-sm text-white/35 italic">
                  No invite link yet — generate one below.
                </p>
              )}

              {copied && (
                <p className="text-xs text-emerald-400 font-medium">Link copied!</p>
              )}

              <form onSubmit={handleCreateInvite}>
                <button
                  type="submit"
                  disabled={isGeneratingLink}
                  className="flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-xs font-semibold text-white/40 transition-colors hover:border-[#60a5fa]/30 hover:text-[#60a5fa] disabled:opacity-50"
                >
                  {isGeneratingLink ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <RefreshCw className="h-3.5 w-3.5" />
                  )}
                  {inviteUrl ? "Regenerate link" : "Generate link"}
                </button>
              </form>
            </div>

            {/* Attendees */}
            <div className="px-6 py-5 flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-[#60a5fa]" />
                <span className="text-sm font-bold text-white">
                  Attendees
                  {event.rsvps.length > 0 && (
                    <span className="ml-2 rounded-full bg-[#004ac6]/15 px-2 py-0.5 text-[11px] font-semibold text-[#60a5fa]">
                      {event.rsvps.length}
                    </span>
                  )}
                </span>
              </div>

              {event.rsvps.length === 0 ? (
                <div className="flex flex-col items-center gap-2 rounded-xl border border-white/8 bg-white/5 py-10 text-center">
                  <Users className="h-6 w-6 text-white/20" />
                  <p className="text-sm text-white/40">No responses yet.</p>
                  <p className="text-xs text-white/25">
                    Share the invite link to start collecting RSVPs.
                  </p>
                </div>
              ) : (
                <div className="rounded-xl border border-white/8 overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-white/5 border-b border-white/8 hover:bg-white/5">
                        <TableHead className="text-white/40 font-semibold text-xs">Name</TableHead>
                        <TableHead className="text-white/40 font-semibold text-xs">Email</TableHead>
                        <TableHead className="text-white/40 font-semibold text-xs">Status</TableHead>
                        <TableHead className="text-white/40 font-semibold text-xs">Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {event.rsvps.map((rsvp) => {
                        const cfg =
                          STATUS_CONFIG[rsvp.status as keyof typeof STATUS_CONFIG] ?? {
                            label: rsvp.status,
                            icon: HelpCircle,
                            badge: "bg-white/5 border border-white/10 text-white/40",
                          };
                        const Icon = cfg.icon;

                        return (
                          <TableRow key={rsvp.id} className="border-b border-white/8 last:border-0 hover:bg-white/3">
                            <TableCell className="font-semibold text-white text-sm">
                              {rsvp.name}
                            </TableCell>
                            <TableCell className="text-white/40 text-xs">
                              {rsvp.email}
                            </TableCell>
                            <TableCell>
                              <span
                                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${cfg.badge}`}
                              >
                                <Icon className="h-3 w-3" />
                                {cfg.label}
                              </span>
                            </TableCell>
                            <TableCell className="text-white/40 text-xs">
                              {new Date(rsvp.respondedAt).toLocaleDateString(undefined, {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
