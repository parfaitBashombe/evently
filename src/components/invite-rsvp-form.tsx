"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { Field, FieldLabel, FieldDescription } from "./ui/field";
import { Input } from "./ui/input";
import { Loader2 } from "lucide-react";

export const InviteRsvpForm = ({
  token,
  initialSubmitted,
}: {
  token: string;
  initialSubmitted: boolean;
}) => {
  const [submitted, setSubmitted] = useState(initialSubmitted);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPending(true);
    setError(null);
    const formData = new FormData(e.currentTarget);

    try {
      const response = await fetch(`/api/invite/${token}/rsvp`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
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
    <>
      {submitted ? (
        <p className="mb-4 rounded-md border border-(--accent)/50 bg-(--accent)/15 p-3 text-sm text-[#e9dbff]">
          Thanks. Your RSVP has been recorded (or updated).
        </p>
      ) : null}

      {error ? (
        <p className="mb-4 rounded-md border border-red-500/50 bg-red-500/15 p-3 text-sm text-red-200">
          {error}
        </p>
      ) : null}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Field>
          <FieldLabel htmlFor="name">Name</FieldLabel>
          <Input
            id="name"
            name="name"
            required
            placeholder="Your name"
            autoComplete="off"
            disabled={pending}
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
            disabled={pending}
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
            disabled={pending}
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
        <Button type="submit" disabled={pending}>
          {pending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting…
            </>
          ) : (
            "Submit RSVP"
          )}
        </Button>
      </form>
    </>
  );
};
