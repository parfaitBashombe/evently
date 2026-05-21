"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TipTapEditor } from "@/components/tiptap-editor";
import { ImageUpload } from "@/components/image-upload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel, FieldDescription } from "@/components/ui/field";
import { ArrowLeft, Loader2, Save } from "lucide-react";

const CATEGORIES = [
  "Conference",
  "Workshop",
  "Meetup",
  "Party",
  "Concert",
  "Sports",
  "Networking",
  "Webinar",
  "Other",
];

interface EventFormProps {
  mode: "create" | "edit";
  eventId?: string;
  defaultValues?: {
    title?: string;
    description?: string | null;
    content?: string | null;
    location?: string | null;
    category?: string | null;
    coverImage?: string | null;
    status?: "draft" | "published" | "cancelled";
    eventDate?: string | null;
    endDate?: string | null;
    capacity?: number | null;
    isPublic?: boolean;
  };
}

function toLocalInput(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

const STATUS_LABELS = {
  draft: { label: "Draft", color: "text-amber-400 bg-amber-500/10 border-amber-500/30" },
  published: { label: "Published", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30" },
  cancelled: { label: "Cancelled", color: "text-red-400 bg-red-500/10 border-red-500/30" },
};

export const EventForm = ({ mode, eventId, defaultValues = {} }: EventFormProps) => {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState(defaultValues.title ?? "");
  const [description, setDescription] = useState(defaultValues.description ?? "");
  const [content, setContent] = useState(defaultValues.content ?? "");
  const [location, setLocation] = useState(defaultValues.location ?? "");
  const [category, setCategory] = useState(defaultValues.category ?? "");
  const [coverImage, setCoverImage] = useState<string | null>(defaultValues.coverImage ?? null);
  const [status, setStatus] = useState<"draft" | "published" | "cancelled">(
    defaultValues.status ?? "draft"
  );
  const [eventDate, setEventDate] = useState(toLocalInput(defaultValues.eventDate));
  const [endDate, setEndDate] = useState(toLocalInput(defaultValues.endDate));
  const [capacity, setCapacity] = useState(defaultValues.capacity?.toString() ?? "");
  const [isPublic, setIsPublic] = useState(defaultValues.isPublic ?? false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setPending(true);
    setError(null);

    const body = {
      title,
      description,
      content,
      location,
      category,
      coverImage,
      status,
      isPublic,
      eventDate: eventDate || null,
      endDate: endDate || null,
      capacity,
    };

    try {
      const url = mode === "create" ? "/api/events" : `/api/events/${eventId}`;
      const method = mode === "create" ? "POST" : "PUT";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save event");
      }
      if (mode === "create") {
        const { id } = await res.json();
        router.push(`/events/${id}`);
      } else {
        router.push(`/events/${eventId}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setPending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8">
      {/* Cover image */}
      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          Cover image
        </h2>
        <ImageUpload value={coverImage} onChange={setCoverImage} />
      </section>

      {/* Basics */}
      <section className="flex flex-col gap-4">
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          Basics
        </h2>

        <Field>
          <FieldLabel htmlFor="title">Title *</FieldLabel>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Team dinner, product launch, meetup…"
            required
            disabled={pending}
            className="text-base"
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="description">Short description</FieldLabel>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="One or two sentences shown in previews and invite links…"
            disabled={pending}
            rows={2}
            maxLength={500}
            className="flex w-full resize-none rounded-lg border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50"
          />
          <FieldDescription>Max 500 characters</FieldDescription>
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="category">Category</FieldLabel>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              disabled={pending}
              className="flex h-9 w-full rounded-lg border border-input bg-transparent px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50 [&>option]:bg-popover"
            >
              <option value="">Select category…</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </Field>

          <Field>
            <FieldLabel htmlFor="location">Location</FieldLabel>
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Venue, city, or online…"
              disabled={pending}
            />
          </Field>
        </div>

        {/* Status */}
        <Field>
          <FieldLabel>Status</FieldLabel>
          <div className="flex gap-2">
            {(["draft", "published", "cancelled"] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStatus(s)}
                disabled={pending}
                className={`rounded-full border px-3 py-1 text-xs font-medium transition-all ${
                  status === s
                    ? STATUS_LABELS[s].color
                    : "border-border text-muted-foreground hover:border-violet-500/30 hover:text-foreground"
                }`}
              >
                {STATUS_LABELS[s].label}
              </button>
            ))}
          </div>
          <FieldDescription>
            Only published events are visible on their public page.
          </FieldDescription>
        </Field>

        {/* Visibility */}
        <Field>
          <FieldLabel>Visibility</FieldLabel>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setIsPublic(false)}
              disabled={pending}
              className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-all ${
                !isPublic
                  ? "border-violet-500/40 bg-violet-500/10 text-violet-400"
                  : "border-border text-muted-foreground hover:border-violet-500/30 hover:text-foreground"
              }`}
            >
              🔒 Private
            </button>
            <button
              type="button"
              onClick={() => setIsPublic(true)}
              disabled={pending}
              className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-all ${
                isPublic
                  ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                  : "border-border text-muted-foreground hover:border-emerald-500/20 hover:text-foreground"
              }`}
            >
              🌐 Public
            </button>
          </div>
          <FieldDescription>
            {isPublic
              ? "Discoverable on the home page — anyone can find and RSVP."
              : "Invite-only — only people with the link can RSVP. Not listed publicly."}
          </FieldDescription>
        </Field>
      </section>

      {/* When */}
      <section className="flex flex-col gap-4">
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          When &amp; Capacity
        </h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="eventDate">Start date &amp; time</FieldLabel>
            <Input
              id="eventDate"
              type="datetime-local"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              disabled={pending}
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="endDate">End date &amp; time</FieldLabel>
            <Input
              id="endDate"
              type="datetime-local"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              disabled={pending}
            />
          </Field>
        </div>

        <Field>
          <FieldLabel htmlFor="capacity">Capacity</FieldLabel>
          <Input
            id="capacity"
            type="number"
            min="1"
            value={capacity}
            onChange={(e) => setCapacity(e.target.value)}
            placeholder="Leave blank for unlimited"
            disabled={pending}
            className="max-w-[200px]"
          />
          <FieldDescription>Maximum number of attendees.</FieldDescription>
        </Field>
      </section>

      {/* Content */}
      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          Event details
        </h2>
        <TipTapEditor
          content={content}
          onChange={setContent}
          placeholder="Describe your event in detail — schedule, speakers, what to bring…"
        />
      </section>

      {/* Error */}
      {error && (
        <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </p>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between gap-3 border-t border-border pt-6">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          disabled={pending}
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back
        </Button>

        <Button type="submit" disabled={pending || !title.trim()}>
          {pending ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Saving…
            </>
          ) : (
            <>
              <Save className="h-3.5 w-3.5" />
              {mode === "create" ? "Create event" : "Save changes"}
            </>
          )}
        </Button>
      </div>
    </form>
  );
};
