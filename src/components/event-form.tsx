"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TipTapEditor } from "@/components/tiptap-editor";
import { ImageUpload } from "@/components/image-upload";
import { Field, FieldLabel, FieldDescription } from "@/components/ui/field";
import { FaArrowLeft, FaSpinner, FaFloppyDisk } from "react-icons/fa6";
import { Lock, Globe } from "lucide-react";

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

const STATUS_CONFIG = {
  draft: { label: "Draft", style: "border-amber-500/30 bg-amber-500/15 text-amber-400" },
  published: { label: "Published", style: "border-emerald-500/30 bg-emerald-500/15 text-emerald-400" },
  cancelled: { label: "Cancelled", style: "border-red-500/30 bg-red-500/15 text-red-400" },
};

const inputClass =
  "h-10 w-full min-w-0 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#004ac6]/20 focus-visible:border-[#004ac6]/60 transition-colors disabled:opacity-40";

const selectClass =
  "h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#004ac6]/20 focus-visible:border-[#004ac6]/60 transition-colors disabled:opacity-40 appearance-none";

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
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {/* Cover image */}
      <div className="rounded-2xl border border-white/8 bg-[#0e1528] overflow-hidden">
        <div className="px-6 py-4 border-b border-white/8">
          <h2 className="text-sm font-bold text-white">Cover Image</h2>
          <p className="text-xs text-white/40 mt-0.5">Upload a banner image for your event page.</p>
        </div>
        <div className="p-6">
          <ImageUpload value={coverImage} onChange={setCoverImage} />
        </div>
      </div>

      {/* Basics */}
      <div className="rounded-2xl border border-white/8 bg-[#0e1528]">
        <div className="px-6 py-4 border-b border-white/8">
          <h2 className="text-sm font-bold text-white">Event Details</h2>
          <p className="text-xs text-white/40 mt-0.5">Basic information about your event.</p>
        </div>
        <div className="p-6 flex flex-col gap-5">
          <Field>
            <FieldLabel htmlFor="title">
              <span className="text-xs font-semibold text-white/55">Title <span className="text-[#60a5fa]">*</span></span>
            </FieldLabel>
            <input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Team dinner, product launch, meetup…"
              required
              disabled={pending}
              className={inputClass}
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="description">
              <span className="text-xs font-semibold text-white/55">Short description</span>
            </FieldLabel>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="One or two sentences shown in previews and invite links…"
              disabled={pending}
              rows={2}
              maxLength={500}
              className="flex w-full resize-none rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-white/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#004ac6]/20 focus-visible:border-[#004ac6]/60 disabled:opacity-40 transition-colors"
            />
            <FieldDescription><span className="text-xs text-white/30">Max 500 characters</span></FieldDescription>
          </Field>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="category">
                <span className="text-xs font-semibold text-white/55">Category</span>
              </FieldLabel>
              <div className="relative">
                <select
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  disabled={pending}
                  className={selectClass}
                >
                  <option value="" className="bg-[#0e1528] text-white/40">Select category…</option>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c} className="bg-[#0e1528] text-white">{c}</option>
                  ))}
                </select>
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-white/40">
                  ▾
                </span>
              </div>
            </Field>

            <Field>
              <FieldLabel htmlFor="location">
                <span className="text-xs font-semibold text-white/55">Location</span>
              </FieldLabel>
              <input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Venue, city, or online…"
                disabled={pending}
                className={inputClass}
              />
            </Field>
          </div>
        </div>
      </div>

      {/* Status & Visibility */}
      <div className="rounded-2xl border border-white/8 bg-[#0e1528]">
        <div className="px-6 py-4 border-b border-white/8">
          <h2 className="text-sm font-bold text-white">Status &amp; Visibility</h2>
          <p className="text-xs text-white/40 mt-0.5">Control who can see and attend your event.</p>
        </div>
        <div className="p-6 flex flex-col gap-5">
          <Field>
            <FieldLabel>
              <span className="text-xs font-semibold text-white/55">Status</span>
            </FieldLabel>
            <div className="flex gap-2 flex-wrap">
              {(["draft", "published", "cancelled"] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStatus(s)}
                  disabled={pending}
                  className={`rounded-full border px-4 py-1.5 text-xs font-semibold transition-all ${
                    status === s
                      ? STATUS_CONFIG[s].style
                      : "border-white/10 text-white/40 hover:border-white/20 hover:text-white/70"
                  }`}
                >
                  {STATUS_CONFIG[s].label}
                </button>
              ))}
            </div>
            <FieldDescription>
              <span className="text-xs text-white/30">Only published events are visible on their public page.</span>
            </FieldDescription>
          </Field>

          <Field>
            <FieldLabel>
              <span className="text-xs font-semibold text-white/55">Visibility</span>
            </FieldLabel>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setIsPublic(false)}
                disabled={pending}
                className={`flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-xs font-semibold transition-all ${
                  !isPublic
                    ? "border-[#004ac6]/30 bg-[#004ac6]/15 text-[#60a5fa]"
                    : "border-white/10 text-white/40 hover:border-white/20 hover:text-white/70"
                }`}
              >
                <Lock className="h-3 w-3" /> Private
              </button>
              <button
                type="button"
                onClick={() => setIsPublic(true)}
                disabled={pending}
                className={`flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-xs font-semibold transition-all ${
                  isPublic
                    ? "border-emerald-500/30 bg-emerald-500/15 text-emerald-400"
                    : "border-white/10 text-white/40 hover:border-white/20 hover:text-white/70"
                }`}
              >
                <Globe className="h-3 w-3" /> Public
              </button>
            </div>
            <FieldDescription>
              <span className="text-xs text-white/30">
                {isPublic
                  ? "Discoverable on the home page — anyone can find and RSVP."
                  : "Invite-only — only people with the link can RSVP. Not listed publicly."}
              </span>
            </FieldDescription>
          </Field>
        </div>
      </div>

      {/* When & Capacity */}
      <div className="rounded-2xl border border-white/8 bg-[#0e1528]">
        <div className="px-6 py-4 border-b border-white/8">
          <h2 className="text-sm font-bold text-white">When &amp; Capacity</h2>
          <p className="text-xs text-white/40 mt-0.5">Set dates and limit attendee numbers.</p>
        </div>
        <div className="p-6 flex flex-col gap-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="eventDate">
                <span className="text-xs font-semibold text-white/55">Start date &amp; time</span>
              </FieldLabel>
              <input
                id="eventDate"
                type="datetime-local"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                disabled={pending}
                className={inputClass}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="endDate">
                <span className="text-xs font-semibold text-white/55">End date &amp; time</span>
              </FieldLabel>
              <input
                id="endDate"
                type="datetime-local"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                disabled={pending}
                className={inputClass}
              />
            </Field>
          </div>

          <Field>
            <FieldLabel htmlFor="capacity">
              <span className="text-xs font-semibold text-white/55">Capacity</span>
            </FieldLabel>
            <input
              id="capacity"
              type="number"
              min="1"
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              placeholder="Leave blank for unlimited"
              disabled={pending}
              className={`${inputClass} max-w-[220px]`}
            />
            <FieldDescription>
              <span className="text-xs text-white/30">Maximum number of &quot;Going&quot; attendees.</span>
            </FieldDescription>
          </Field>
        </div>
      </div>

      {/* Event details / Rich content */}
      <div className="rounded-2xl border border-white/8 bg-[#0e1528] overflow-hidden">
        <div className="px-6 py-4 border-b border-white/8">
          <h2 className="text-sm font-bold text-white">Rich Content</h2>
          <p className="text-xs text-white/40 mt-0.5">Describe your event in detail — schedule, speakers, what to bring.</p>
        </div>
        <TipTapEditor
          content={content}
          onChange={setContent}
          placeholder="Start writing…"
        />
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between gap-3 pt-2">
        <button
          type="button"
          onClick={() => router.back()}
          disabled={pending}
          className="flex items-center gap-1.5 rounded-lg px-4 py-2.5 text-sm font-semibold text-white/40 transition-colors hover:text-white/70 disabled:opacity-50"
        >
          <FaArrowLeft className="h-3.5 w-3.5" />
          Back
        </button>

        <button
          type="submit"
          disabled={pending || !title.trim()}
          style={{ background: "linear-gradient(135deg, #004ac6, #6d28d9)" }}
          className="flex items-center gap-2 rounded-lg px-7 py-2.5 text-sm font-bold text-white disabled:opacity-50 shadow-sm active:scale-95 duration-150 transition-transform"
        >
          {pending ? (
            <>
              <FaSpinner className="h-3.5 w-3.5 animate-spin" />
              Saving…
            </>
          ) : (
            <>
              <FaFloppyDisk className="h-3.5 w-3.5" />
              {mode === "create" ? "Create event" : "Save changes"}
            </>
          )}
        </button>
      </div>
    </form>
  );
};
