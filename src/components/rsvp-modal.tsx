"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  FaCalendarDays,
  FaLocationDot,
  FaCircleCheck,
  FaCircleQuestion,
  FaCircleXmark,
  FaSpinner,
} from "react-icons/fa6";

interface EventData {
  title: string;
  description: string | null;
  location: string | null;
  eventDate: string | null;
}

type RsvpStatus = "going" | "maybe" | "not_going";

const STATUS_OPTIONS = [
  {
    value: "going" as RsvpStatus,
    label: "Going",
    icon: FaCircleCheck,
    className: "text-emerald-400 border-emerald-500/40 bg-emerald-500/10",
    idleClassName: "text-muted-foreground/40 border-border bg-transparent",
  },
  {
    value: "maybe" as RsvpStatus,
    label: "Maybe",
    icon: FaCircleQuestion,
    className: "text-amber-400 border-amber-500/40 bg-amber-500/10",
    idleClassName: "text-muted-foreground/40 border-border bg-transparent",
  },
  {
    value: "not_going" as RsvpStatus,
    label: "Can't go",
    icon: FaCircleXmark,
    className: "text-red-400 border-red-500/40 bg-red-500/10",
    idleClassName: "text-muted-foreground/40 border-border bg-transparent",
  },
] as const;

export const RsvpModal = ({ token }: { token: string }) => {
  const router = useRouter();
  const [open, setOpen] = useState(true);
  const [event, setEvent] = useState<EventData | null>(null);
  const [loading, setLoading] = useState(true);
  const [invalid, setInvalid] = useState(false);
  const [status, setStatus] = useState<RsvpStatus>("going");
  const [pending, setPending] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/invite/${token}`)
      .then((res) => {
        if (!res.ok) { setInvalid(true); return null; }
        return res.json();
      })
      .then((data) => { if (data) setEvent(data.event); })
      .catch(() => setInvalid(true))
      .finally(() => setLoading(false));
  }, [token]);

  const handleOpenChange = (v: boolean) => {
    if (!v) router.replace("/", { scroll: false });
    setOpen(v);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPending(true);
    setError(null);
    const formData = new FormData(e.currentTarget);
    formData.set("status", status);
    try {
      const res = await fetch(`/api/invite/${token}/rsvp`, {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to submit RSVP");
      }
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setPending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 h-px rounded-t-xl bg-blue-500/50"
        />

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <FaSpinner className="h-7 w-7 animate-spin text-blue-400" />
          </div>
        ) : invalid ? (
          <div className="flex flex-col items-center gap-3 py-12 text-center">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-500/10">
              <FaCircleXmark className="h-5 w-5 text-red-400" />
            </span>
            <DialogTitle className="text-base font-semibold">
              Invite not found
            </DialogTitle>
            <p className="text-sm text-muted-foreground max-w-xs">
              This invite link is invalid or has expired. Ask the organiser for
              a new one.
            </p>
          </div>
        ) : submitted ? (
          <div className="flex flex-col items-center gap-4 py-12 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10">
              <FaCircleCheck className="h-6 w-6 text-emerald-400" />
            </span>
            <div className="flex flex-col gap-1">
              <DialogTitle className="text-lg font-bold">
                You&apos;re all set!
              </DialogTitle>
              <p className="text-sm text-muted-foreground max-w-xs">
                Your RSVP has been recorded. Visit this link again any time to
                update it.
              </p>
            </div>
            <Button size="sm" onClick={() => handleOpenChange(false)}>
              Close
            </Button>
          </div>
        ) : (
          <>
            {/* Event info */}
            <div className="flex flex-col gap-1.5">
              <p className="text-[11px] font-medium uppercase tracking-wider text-blue-400">
                You&apos;re invited
              </p>
              <DialogTitle className="text-xl font-bold leading-snug">
                {event?.title}
              </DialogTitle>
              <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-muted-foreground">
                {event?.eventDate && (
                  <span className="flex items-center gap-1.5">
                    <FaCalendarDays className="h-3.5 w-3.5 text-blue-400" />
                    {new Date(event.eventDate).toLocaleString(undefined, {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                )}
                {event?.location && (
                  <span className="flex items-center gap-1.5">
                    <FaLocationDot className="h-3.5 w-3.5 text-blue-400" />
                    {event.location}
                  </span>
                )}
              </div>
              {event?.description && (
                <p className="text-sm text-muted-foreground leading-relaxed mt-0.5">
                  {event.description}
                </p>
              )}
            </div>

            <div className="h-px bg-border" />

            {error && (
              <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
                {error}
              </p>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <Field>
                <FieldLabel htmlFor="rsvp-name">Your name</FieldLabel>
                <Input
                  id="rsvp-name"
                  name="name"
                  required
                  placeholder="Alex Johnson"
                  disabled={pending}
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="rsvp-email">Email</FieldLabel>
                <Input
                  id="rsvp-email"
                  name="email"
                  type="email"
                  required
                  placeholder="you@example.com"
                  disabled={pending}
                />
              </Field>

              <Field>
                <FieldLabel>Are you attending?</FieldLabel>
                <input type="hidden" name="status" value={status} />
                <div className="grid grid-cols-3 gap-2">
                  {STATUS_OPTIONS.map(
                    ({ value, label, icon: Icon, className, idleClassName }) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setStatus(value)}
                        disabled={pending}
                        className={`flex flex-col items-center gap-1.5 rounded-xl border px-3 py-3.5 text-xs font-medium transition-all duration-150 cursor-pointer ${status === value ? className : idleClassName}`}
                      >
                        <Icon className="h-4 w-4" />
                        {label}
                      </button>
                    )
                  )}
                </div>
              </Field>

              <Button type="submit" disabled={pending} className="w-full">
                {pending ? (
                  <>
                    <FaSpinner className="h-3.5 w-3.5 animate-spin" />
                    Submitting…
                  </>
                ) : (
                  "Confirm RSVP"
                )}
              </Button>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
