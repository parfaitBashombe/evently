"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel } from "@/components/ui/field";
import {
  CheckCircle2,
  HelpCircle,
  XCircle,
  Loader2,
  PartyPopper,
} from "lucide-react";

type RsvpStatus = "going" | "maybe" | "not_going";

const STATUS_OPTIONS = [
  {
    value: "going" as RsvpStatus,
    label: "Going",
    icon: CheckCircle2,
    active: "text-emerald-400 border-emerald-500/40 bg-emerald-500/10",
    idle: "text-muted-foreground/50 border-border bg-transparent hover:border-emerald-500/20 hover:text-emerald-400/60",
  },
  {
    value: "maybe" as RsvpStatus,
    label: "Maybe",
    icon: HelpCircle,
    active: "text-amber-400 border-amber-500/40 bg-amber-500/10",
    idle: "text-muted-foreground/50 border-border bg-transparent hover:border-amber-500/20 hover:text-amber-400/60",
  },
  {
    value: "not_going" as RsvpStatus,
    label: "Can't go",
    icon: XCircle,
    active: "text-red-400 border-red-500/40 bg-red-500/10",
    idle: "text-muted-foreground/50 border-border bg-transparent hover:border-red-500/20 hover:text-red-400/60",
  },
] as const;

export const PublicRsvpForm = ({ token }: { token: string }) => {
  const [status, setStatus] = useState<RsvpStatus>("going");
  const [pending, setPending] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setPending(false);
    }
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-2xl border border-border bg-card p-8 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-500/10">
          <PartyPopper className="h-6 w-6 text-violet-400" />
        </span>
        <div className="flex flex-col gap-1">
          <p className="text-lg font-bold">You&apos;re all set!</p>
          <p className="text-sm text-muted-foreground">
            Your RSVP has been recorded. Come back any time to update it.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <p className="mb-4 text-sm font-semibold">RSVP to this event</p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Status toggle */}
        <div className="grid grid-cols-3 gap-2">
          {STATUS_OPTIONS.map(({ value, label, icon: Icon, active, idle }) => (
            <button
              key={value}
              type="button"
              onClick={() => setStatus(value)}
              disabled={pending}
              className={`flex flex-col items-center gap-1.5 rounded-xl border px-2 py-3 text-xs font-medium transition-all ${
                status === value ? active : idle
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>

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
          <FieldLabel htmlFor="rsvp-message">
            Message{" "}
            <span className="text-muted-foreground font-normal">(optional)</span>
          </FieldLabel>
          <textarea
            id="rsvp-message"
            name="message"
            placeholder="Anything you want the organiser to know…"
            disabled={pending}
            rows={2}
            maxLength={500}
            className="flex w-full resize-none rounded-lg border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50"
          />
        </Field>

        {error && (
          <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
            {error}
          </p>
        )}

        <Button type="submit" disabled={pending} className="w-full">
          {pending ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Submitting…
            </>
          ) : (
            "Confirm RSVP"
          )}
        </Button>
      </form>
    </div>
  );
};
