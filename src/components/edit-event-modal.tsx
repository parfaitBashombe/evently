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
import { Pencil, ArrowRight, Loader2, CalendarCog } from "lucide-react";

interface EditEventModalProps {
  event: {
    id: string;
    title: string;
    description: string | null;
    location: string | null;
    eventDate: string | null;
  };
  onSuccess?: () => void;
}

export const EditEventModal = ({ event, onSuccess }: EditEventModalProps) => {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const toDatetimeLocal = (iso: string | null): string => {
    if (!iso) return "";
    const d = new Date(iso);
    const p = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPending(true);
    const formData = new FormData(e.currentTarget);
    try {
      const response = await fetch(`/api/events/${event.id}`, {
        method: "PUT",
        body: formData,
      });
      if (!response.ok) throw new Error("Failed to update event");
      onSuccess?.();
      setOpen(false);
    } finally {
      setPending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="border-white/10 gap-1.5">
          <Pencil className="h-3.5 w-3.5" />
          Edit event
        </Button>
      </DialogTrigger>

      <DialogContent
        className="sm:max-w-lg"
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

        <DialogHeader className="mb-2">
          <div className="flex items-center gap-3">
            <span
              className="flex h-9 w-9 items-center justify-center rounded-xl"
              style={{ background: "rgba(149,95,255,0.15)" }}
            >
              <CalendarCog className="h-5 w-5 text-violet-400" />
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
              Edit Event
            </DialogTitle>
          </div>
        </DialogHeader>

        <form
          ref={formRef}
          onSubmit={handleSubmit}
          className="flex flex-col gap-5"
        >
          <Field>
            <FieldLabel htmlFor="edit-title">Title</FieldLabel>
            <Input
              id="edit-title"
              name="title"
              required
              defaultValue={event.title}
              placeholder="Team dinner..."
              className="border-white/10 bg-white/5 focus-visible:border-violet-500/50 focus-visible:ring-violet-500/20"
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="edit-description">Description</FieldLabel>
            <Textarea
              id="edit-description"
              name="description"
              defaultValue={event.description ?? ""}
              placeholder="Optional details about the event"
              className="border-white/10 bg-white/5 focus-visible:border-violet-500/50 focus-visible:ring-violet-500/20 resize-none"
              rows={3}
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="edit-location">Location</FieldLabel>
            <Input
              id="edit-location"
              name="location"
              defaultValue={event.location ?? ""}
              placeholder="Optional location"
              className="border-white/10 bg-white/5 focus-visible:border-violet-500/50 focus-visible:ring-violet-500/20"
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="edit-eventDate">Date and time</FieldLabel>
            <Input
              id="edit-eventDate"
              name="eventDate"
              type="datetime-local"
              defaultValue={toDatetimeLocal(event.eventDate)}
              className="border-white/10 bg-white/5 focus-visible:border-violet-500/50 focus-visible:ring-violet-500/20"
            />
            <FieldDescription className="text-xs text-muted-foreground">
              Optional — leave blank to keep unset.
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
                  Saving…
                </>
              ) : (
                <>
                  Save changes
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
