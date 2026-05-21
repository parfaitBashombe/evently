"use client";

import { useState } from "react";
import { Field, FieldLabel } from "@/components/ui/field";
import {
  FaCircleCheck,
  FaCircleQuestion,
  FaCircleXmark,
  FaSpinner,
} from "react-icons/fa6";

type RsvpStatus = "going" | "maybe" | "not_going";

const STATUS_OPTIONS = [
  {
    value: "going" as RsvpStatus,
    label: "Going",
    icon: FaCircleCheck,
    active: "text-emerald-400 border-emerald-500/30 bg-emerald-500/15",
    idle: "text-white/40 border-white/10 bg-transparent hover:border-emerald-500/25 hover:text-emerald-400",
  },
  {
    value: "maybe" as RsvpStatus,
    label: "Maybe",
    icon: FaCircleQuestion,
    active: "text-amber-400 border-amber-500/30 bg-amber-500/15",
    idle: "text-white/40 border-white/10 bg-transparent hover:border-amber-500/25 hover:text-amber-400",
  },
  {
    value: "not_going" as RsvpStatus,
    label: "Can't go",
    icon: FaCircleXmark,
    active: "text-red-400 border-red-500/30 bg-red-500/15",
    idle: "text-white/40 border-white/10 bg-transparent hover:border-red-500/25 hover:text-red-400",
  },
] as const;

const inputClass =
  "h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#004ac6]/20 focus-visible:border-[#004ac6]/60 transition-colors disabled:opacity-40";

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
      <div className="flex flex-col items-center gap-5 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-8 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/15">
          <FaCircleCheck className="h-7 w-7 text-emerald-400" />
        </span>
        <div className="flex flex-col gap-1.5">
          <p className="text-lg font-bold text-white">You&apos;re all set!</p>
          <p className="text-sm text-white/45 leading-relaxed max-w-xs">
            Your RSVP has been recorded. Come back any time to update it.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/8 bg-[#0e1528] p-6">
      <p className="mb-5 text-base font-bold text-white">RSVP to this event</p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Status toggle */}
        <div className="grid grid-cols-3 gap-2">
          {STATUS_OPTIONS.map(({ value, label, icon: Icon, active, idle }) => (
            <button
              key={value}
              type="button"
              onClick={() => setStatus(value)}
              disabled={pending}
              className={`flex flex-col items-center gap-2 rounded-xl border px-2 py-3.5 text-xs font-semibold transition-all ${
                status === value ? active : idle
              }`}
            >
              <Icon className="h-5 w-5" />
              <span>{label}</span>
            </button>
          ))}
        </div>

        <Field>
          <FieldLabel htmlFor="rsvp-name">
            <span className="text-xs font-semibold text-white/55">Your name</span>
          </FieldLabel>
          <input
            id="rsvp-name"
            name="name"
            required
            placeholder="Alex Johnson"
            disabled={pending}
            className={inputClass}
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="rsvp-email">
            <span className="text-xs font-semibold text-white/55">Email</span>
          </FieldLabel>
          <input
            id="rsvp-email"
            name="email"
            type="email"
            required
            placeholder="you@example.com"
            disabled={pending}
            className={inputClass}
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="rsvp-message">
            <span className="text-xs font-semibold text-white/55">
              Message <span className="text-white/30 font-normal">(optional)</span>
            </span>
          </FieldLabel>
          <textarea
            id="rsvp-message"
            name="message"
            placeholder="Anything you want the organiser to know…"
            disabled={pending}
            rows={2}
            maxLength={500}
            className="flex w-full resize-none rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#004ac6]/20 focus-visible:border-[#004ac6]/60 disabled:opacity-40 transition-colors"
          />
        </Field>

        {error && (
          <p className="border border-red-500/20 bg-red-500/10 text-red-400 text-sm px-3 py-2 rounded-lg">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          style={{ background: "linear-gradient(135deg, #004ac6, #6d28d9)" }}
          className="w-full flex items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-bold text-white disabled:opacity-50 shadow-sm"
        >
          {pending ? (
            <>
              <FaSpinner className="h-3.5 w-3.5 animate-spin" />
              Submitting…
            </>
          ) : (
            "Confirm RSVP"
          )}
        </button>
      </form>
    </div>
  );
};
