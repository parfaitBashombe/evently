"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldLabel, FieldDescription } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createEventAction } from "@/lib/actions/events";
import { CalendarPlus, ArrowRight, Loader2 } from "lucide-react";

export const CreateEventModal = () => {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPending(true);
    const formData = new FormData(e.currentTarget);
    try {
      await createEventAction(formData);
      setOpen(false);
      formRef.current?.reset();
    } finally {
      setPending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg">
          <CalendarPlus className="mr-2 h-4 w-4" />
          Create event
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </DialogTrigger>

      <DialogContent
        className="sm:max-w-lg"
        style={{
          background: "linear-gradient(160deg, #1a0f2e 0%, #16161f 100%)",
          border: "1px solid rgba(149,95,255,0.2)",
        }}
      >
        {/* Top-edge violet line */}
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 h-px rounded-t-lg"
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, #955fff 40%, #c084fc 60%, transparent 100%)",
            opacity: 0.6,
          }}
        />

        <DialogHeader className="mb-2">
          <div className="flex items-center gap-3">
            <span
              className="flex h-9 w-9 items-center justify-center rounded-xl"
              style={{ background: "rgba(149,95,255,0.15)" }}
            >
              <CalendarPlus className="h-5 w-5 text-violet-400" />
            </span>
            <DialogTitle
              className="text-xl font-bold tracking-tight"
              style={{
                background:
                  "linear-gradient(135deg, #ffffff 30%, #c084fc 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Create Event
            </DialogTitle>
          </div>
        </DialogHeader>

        <form
          ref={formRef}
          onSubmit={handleSubmit}
          className="flex flex-col gap-5"
        >
          <Field>
            <FieldLabel htmlFor="title">Title</FieldLabel>
            <Input
              id="title"
              name="title"
              required
              placeholder="Team dinner..."
              className="border-white/10 bg-white/5 focus-visible:border-violet-500/50 focus-visible:ring-violet-500/20"
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="description">Description</FieldLabel>
            <Textarea
              id="description"
              name="description"
              placeholder="Optional details about the event"
              className="border-white/10 bg-white/5 focus-visible:border-violet-500/50 focus-visible:ring-violet-500/20 resize-none"
              rows={3}
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="location">Location</FieldLabel>
            <Input
              id="location"
              name="location"
              placeholder="Optional location"
              className="border-white/10 bg-white/5 focus-visible:border-violet-500/50 focus-visible:ring-violet-500/20"
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="eventDate">Date and time</FieldLabel>
            <Input
              id="eventDate"
              name="eventDate"
              type="datetime-local"
              className="border-white/10 bg-white/5 focus-visible:border-violet-500/50 focus-visible:ring-violet-500/20"
            />
            <FieldDescription className="text-xs text-muted-foreground">
              Optional — you can set this later.
            </FieldDescription>
          </Field>

          <div className="flex items-center justify-end gap-3 pt-1">
            <Button
              type="button"
              variant="outline"
              className="border-white/10"
              onClick={() => setOpen(false)}
              disabled={pending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating…
                </>
              ) : (
                <>
                  Create event
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
