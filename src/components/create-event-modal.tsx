"use client";

import { useState } from "react";
import { Field, FieldLabel, FieldDescription } from "@/components/ui/field";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TipTapEditor } from "@/components/tiptap-editor";
import { ImageUpload } from "@/components/image-upload";
import { Lock, Globe, X } from "lucide-react";
import { FaCalendarPlus, FaSpinner, FaFloppyDisk } from "react-icons/fa6";

const CATEGORIES = [
  "Conference", "Workshop", "Meetup", "Party", "Concert",
  "Sports", "Networking", "Webinar", "Other",
];

const STATUS_CONFIG = {
  draft:     { label: "Draft",     style: "text-amber-400 bg-amber-500/15 border-amber-500/25" },
  published: { label: "Published", style: "text-emerald-400 bg-emerald-500/15 border-emerald-500/25" },
  cancelled: { label: "Cancelled", style: "text-red-400 bg-red-500/15 border-red-500/25" },
};

const inputClass =
  "h-10 w-full min-w-0 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#004ac6]/30 focus-visible:border-[#004ac6]/60 transition-colors disabled:opacity-50";

const selectClass =
  "h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#004ac6]/30 focus-visible:border-[#004ac6]/60 transition-colors disabled:opacity-50 appearance-none";

interface CreateEventModalProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSuccess: (id: string) => void;
}

export const CreateEventModal = ({ open, onOpenChange, onSuccess }: CreateEventModalProps) => {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState("");
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [status, setStatus] = useState<"draft" | "published" | "cancelled">("draft");
  const [eventDate, setEventDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [capacity, setCapacity] = useState("");
  const [isPublic, setIsPublic] = useState(false);

  const resetForm = () => {
    setTitle(""); setDescription(""); setContent(""); setLocation("");
    setCategory(""); setCoverImage(null); setStatus("draft");
    setEventDate(""); setEndDate(""); setCapacity(""); setIsPublic(false);
    setError(null);
  };

  const handleOpenChange = (v: boolean) => {
    if (!v) resetForm();
    onOpenChange(v);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setPending(true);
    setError(null);
    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title, description, content, location, category, coverImage,
          status, isPublic, eventDate: eventDate || null,
          endDate: endDate || null, capacity,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create event");
      }
      const { id } = await res.json();
      resetForm();
      onSuccess(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setPending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto border-white/10 bg-[#0e1528] p-0" showCloseButton={false}>
        <div className="absolute inset-x-0 top-0 h-[2px] rounded-t-2xl bg-gradient-to-r from-transparent via-[#004ac6] to-transparent" />

        <DialogHeader className="flex flex-row items-center justify-between gap-3 px-6 pt-6 pb-4 border-b border-white/8">
          <DialogTitle className="flex items-center gap-2.5 text-base font-bold text-white">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#004ac6]/15">
              <FaCalendarPlus className="h-4 w-4 text-[#60a5fa]" />
            </span>
            New Event
          </DialogTitle>
          <button
            onClick={() => handleOpenChange(false)}
            disabled={pending}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-white/40 transition-colors hover:bg-white/8 hover:text-white disabled:opacity-50"
          >
            <X className="h-4 w-4" />
          </button>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-0">
          {/* Cover image */}
          <div className="px-6 py-5 border-b border-white/8">
            <p className="text-xs font-bold text-white/35 uppercase tracking-wider mb-3">Cover Image</p>
            <ImageUpload value={coverImage} onChange={setCoverImage} />
          </div>

          {/* Basics */}
          <div className="px-6 py-5 border-b border-white/8 flex flex-col gap-4">
            <p className="text-xs font-bold text-white/35 uppercase tracking-wider">Event Details</p>

            <Field>
              <FieldLabel htmlFor="ce-title">Title <span className="text-[#60a5fa]">*</span></FieldLabel>
              <input id="ce-title" value={title} onChange={(e) => setTitle(e.target.value)}
                placeholder="Team dinner, product launch, meetup…" required disabled={pending} className={inputClass} />
            </Field>

            <Field>
              <FieldLabel htmlFor="ce-desc">Short description</FieldLabel>
              <textarea id="ce-desc" value={description} onChange={(e) => setDescription(e.target.value)}
                placeholder="One or two sentences shown in previews…" disabled={pending} rows={2} maxLength={500}
                className="flex w-full resize-none rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-white/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#004ac6]/30 focus-visible:border-[#004ac6]/60 disabled:opacity-50 transition-colors"
              />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="ce-cat">Category</FieldLabel>
                <div className="relative">
                  <select id="ce-cat" value={category} onChange={(e) => setCategory(e.target.value)} disabled={pending} className={selectClass}>
                    <option value="" className="bg-[#0e1528]">Select category…</option>
                    {CATEGORIES.map((c) => <option key={c} value={c} className="bg-[#0e1528]">{c}</option>)}
                  </select>
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-white/35 text-xs">▾</span>
                </div>
              </Field>
              <Field>
                <FieldLabel htmlFor="ce-loc">Location</FieldLabel>
                <input id="ce-loc" value={location} onChange={(e) => setLocation(e.target.value)}
                  placeholder="Venue, city, or online…" disabled={pending} className={inputClass} />
              </Field>
            </div>
          </div>

          {/* Status & Visibility */}
          <div className="px-6 py-5 border-b border-white/8 flex flex-col gap-4">
            <p className="text-xs font-bold text-white/35 uppercase tracking-wider">Status &amp; Visibility</p>
            <Field>
              <FieldLabel>Status</FieldLabel>
              <div className="flex gap-2 flex-wrap">
                {(["draft", "published", "cancelled"] as const).map((s) => (
                  <button key={s} type="button" onClick={() => setStatus(s)} disabled={pending}
                    className={`rounded-full border px-3 py-1 text-xs font-semibold capitalize transition-all ${status === s ? STATUS_CONFIG[s].style : "border-white/10 text-white/35 hover:border-[#004ac6]/30 hover:text-[#60a5fa]"}`}>
                    {STATUS_CONFIG[s].label}
                  </button>
                ))}
              </div>
              <FieldDescription>Only published events show on their public page.</FieldDescription>
            </Field>
            <Field>
              <FieldLabel>Visibility</FieldLabel>
              <div className="flex gap-2">
                <button type="button" onClick={() => setIsPublic(false)} disabled={pending}
                  className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold transition-all ${!isPublic ? "border-[#60a5fa]/30 bg-[#004ac6]/15 text-[#60a5fa]" : "border-white/10 text-white/35 hover:border-[#60a5fa]/20 hover:text-[#60a5fa]"}`}>
                  <Lock className="h-3 w-3" /> Private
                </button>
                <button type="button" onClick={() => setIsPublic(true)} disabled={pending}
                  className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold transition-all ${isPublic ? "border-emerald-500/25 bg-emerald-500/15 text-emerald-400" : "border-white/10 text-white/35 hover:border-emerald-500/20 hover:text-emerald-400"}`}>
                  <Globe className="h-3 w-3" /> Public
                </button>
              </div>
              <FieldDescription>{isPublic ? "Discoverable on the home page." : "Only people with the link can RSVP."}</FieldDescription>
            </Field>
          </div>

          {/* When & Capacity */}
          <div className="px-6 py-5 border-b border-white/8 flex flex-col gap-4">
            <p className="text-xs font-bold text-white/35 uppercase tracking-wider">When &amp; Capacity</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="ce-start">Start date &amp; time</FieldLabel>
                <input id="ce-start" type="datetime-local" value={eventDate} onChange={(e) => setEventDate(e.target.value)} disabled={pending} className={inputClass} />
              </Field>
              <Field>
                <FieldLabel htmlFor="ce-end">End date &amp; time</FieldLabel>
                <input id="ce-end" type="datetime-local" value={endDate} onChange={(e) => setEndDate(e.target.value)} disabled={pending} className={inputClass} />
              </Field>
            </div>
            <Field>
              <FieldLabel htmlFor="ce-cap">Capacity</FieldLabel>
              <input id="ce-cap" type="number" min="1" value={capacity} onChange={(e) => setCapacity(e.target.value)}
                placeholder="Unlimited" disabled={pending} className={`${inputClass} max-w-[180px]`} />
              <FieldDescription>Leave blank for unlimited.</FieldDescription>
            </Field>
          </div>

          {/* Rich content */}
          <div className="border-b border-white/8">
            <div className="px-6 pt-5 pb-3">
              <p className="text-xs font-bold text-white/35 uppercase tracking-wider">Rich Content</p>
              <p className="text-xs text-white/30 mt-0.5">Full description — schedule, speakers, what to bring.</p>
            </div>
            <div className="px-6 pb-5">
              <TipTapEditor content={content} onChange={setContent} placeholder="Start writing…" />
            </div>
          </div>

          {error && (
            <div className="mx-6 my-4 rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-400">{error}</div>
          )}

          <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-white/8">
            <button type="button" onClick={() => handleOpenChange(false)} disabled={pending}
              className="flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold text-white/40 transition-colors hover:text-white disabled:opacity-50">
              Cancel
            </button>
            <button type="submit" disabled={pending || !title.trim()}
              className="flex items-center gap-2 rounded-lg px-6 py-2 text-sm font-bold text-white transition-all hover:shadow-[0_0_20px_4px_rgba(0,74,198,0.3)] disabled:opacity-50 active:scale-95 duration-150"
              style={{ background: "linear-gradient(135deg, #004ac6, #6d28d9)" }}>
              {pending ? (
                <><FaSpinner className="h-3.5 w-3.5 animate-spin" /> Creating…</>
              ) : (
                <><FaFloppyDisk className="h-3.5 w-3.5" /> Create event</>
              )}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
