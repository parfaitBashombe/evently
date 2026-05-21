"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ConfirmDeleteModal } from "./confirm-delete-modal";
import { CalendarDays, MapPin, CheckCircle2, HelpCircle, XCircle, Trash2, Users, Tag } from "lucide-react";

interface EventCardProps {
  id: string;
  title: string;
  eventDate: string | null;
  location: string | null;
  category?: string | null;
  status?: string;
  isPublic?: boolean;
  goingCount: number;
  maybeCount: number;
  notGoingCount: number;
  onDelete?: () => void;
  onEventUpdated?: () => void;
  onOpen?: (id: string) => void;
}

const STATUS_CONFIG: Record<string, { dot: string; label: string; badge: string }> = {
  draft:     { dot: "bg-amber-400",   label: "Draft",     badge: "text-amber-400 bg-amber-500/15 border-amber-500/25" },
  published: { dot: "bg-emerald-400", label: "Published", badge: "text-emerald-400 bg-emerald-500/15 border-emerald-500/25" },
  cancelled: { dot: "bg-red-400",     label: "Cancelled", badge: "text-red-400 bg-red-500/15 border-red-500/25" },
};

export const EventCard = ({
  id, title, eventDate, location, category, status = "draft",
  isPublic = false, goingCount, maybeCount, notGoingCount,
  onDelete, onOpen,
}: EventCardProps) => {
  const router = useRouter();
  const [deleteOpen, setDeleteOpen] = useState(false);

  const total = goingCount + maybeCount + notGoingCount;
  const goingPct = total > 0 ? (goingCount / total) * 100 : 0;
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.draft;

  const handleDeleteConfirm = async () => {
    await fetch(`/api/events/${id}`, { method: "DELETE" });
    onDelete?.();
  };

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        className="group relative flex flex-col rounded-2xl border border-white/8 bg-[#0e1528] transition-all duration-200 hover:border-[#004ac6]/40 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-[#004ac6]/10 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#004ac6]/40"
        onClick={() => onOpen ? onOpen(id) : router.push(`/events/${id}`)}
        onKeyDown={(e) => e.key === "Enter" && (onOpen ? onOpen(id) : router.push(`/events/${id}`))}
      >
        {/* Delete button */}
        <button
          className="absolute top-3 right-3 z-10 flex h-7 w-7 items-center justify-center rounded-lg opacity-0 transition-all group-hover:opacity-100 text-white/30 hover:text-red-400 hover:bg-red-500/10"
          onClick={(e) => { e.stopPropagation(); setDeleteOpen(true); }}
          aria-label="Delete event"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>

        {/* Body */}
        <div className="flex flex-col gap-2.5 p-5 pr-12">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold ${cfg.badge}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
              {cfg.label}
            </span>
            {isPublic && (
              <span className="rounded-full bg-[#004ac6]/15 border border-[#004ac6]/25 px-2 py-0.5 text-[11px] font-semibold text-[#60a5fa]">
                Public
              </span>
            )}
          </div>

          <h3 className="font-bold text-white leading-snug text-base group-hover:text-[#60a5fa] transition-colors">
            {title}
          </h3>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-white/40">
            {eventDate && (
              <span className="flex items-center gap-1.5">
                <CalendarDays className="h-3 w-3 text-[#60a5fa]/60" />
                {new Date(eventDate).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric", year: "numeric" })}
              </span>
            )}
            {location && (
              <span className="flex items-center gap-1.5">
                <MapPin className="h-3 w-3 text-[#60a5fa]/60" />
                {location}
              </span>
            )}
            {category && (
              <span className="flex items-center gap-1.5">
                <Tag className="h-3 w-3 text-[#60a5fa]/60" />
                {category}
              </span>
            )}
            {!eventDate && !location && !category && (
              <span className="italic opacity-30">No date or location set</span>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 border-t border-white/6 px-5 py-3">
          {total === 0 ? (
            <span className="flex items-center gap-1.5 text-xs text-white/30">
              <Users className="h-3.5 w-3.5" />
              No responses yet
            </span>
          ) : (
            <>
              <div className="flex items-center gap-1.5">
                <span className="flex items-center gap-1 rounded-full bg-emerald-500/15 border border-emerald-500/20 px-2 py-0.5 text-[11px] font-semibold text-emerald-400">
                  <CheckCircle2 className="h-3 w-3" />{goingCount}
                </span>
                <span className="flex items-center gap-1 rounded-full bg-amber-500/15 border border-amber-500/20 px-2 py-0.5 text-[11px] font-semibold text-amber-400">
                  <HelpCircle className="h-3 w-3" />{maybeCount}
                </span>
                <span className="flex items-center gap-1 rounded-full bg-red-500/15 border border-red-500/20 px-2 py-0.5 text-[11px] font-semibold text-red-400">
                  <XCircle className="h-3 w-3" />{notGoingCount}
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <div className="h-1.5 w-16 overflow-hidden rounded-full bg-white/8">
                  <div className="h-full rounded-full bg-[#004ac6] transition-all duration-500" style={{ width: `${goingPct}%` }} />
                </div>
                <span className="text-[11px] tabular-nums text-white/35">{Math.round(goingPct)}%</span>
              </div>
            </>
          )}
        </div>
      </div>

      <ConfirmDeleteModal open={deleteOpen} onOpenChange={setDeleteOpen} onConfirm={handleDeleteConfirm} />
    </>
  );
};
