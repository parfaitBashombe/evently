"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ConfirmDeleteModal } from "./confirm-delete-modal";
import {
  CalendarDays,
  MapPin,
  CheckCircle2,
  HelpCircle,
  XCircle,
  Trash2,
  Users,
  Tag,
} from "lucide-react";

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
}

const STATUS_DOT: Record<string, string> = {
  draft: "bg-amber-400",
  published: "bg-emerald-400",
  cancelled: "bg-red-400",
};

export const EventCard = ({
  id,
  title,
  eventDate,
  location,
  category,
  status = "draft",
  isPublic = false,
  goingCount,
  maybeCount,
  notGoingCount,
  onDelete,
}: EventCardProps) => {
  const router = useRouter();
  const [deleteOpen, setDeleteOpen] = useState(false);

  const total = goingCount + maybeCount + notGoingCount;
  const goingPct = total > 0 ? (goingCount / total) * 100 : 0;

  const handleDeleteConfirm = async () => {
    await fetch(`/api/events/${id}`, { method: "DELETE" });
    onDelete?.();
  };

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        className="group relative flex flex-col rounded-xl bg-card ring-1 ring-border transition-all duration-200 hover:ring-violet-500/30 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-black/30 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        onClick={() => router.push(`/events/${id}`)}
        onKeyDown={(e) => e.key === "Enter" && router.push(`/events/${id}`)}
      >
        {/* Delete button — appears on hover */}
        <button
          className="absolute top-3 right-3 z-10 flex h-7 w-7 items-center justify-center rounded-md opacity-0 transition-all group-hover:opacity-100 text-muted-foreground hover:text-red-400 hover:bg-red-500/10"
          onClick={(e) => {
            e.stopPropagation();
            setDeleteOpen(true);
          }}
          aria-label="Delete event"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>

        {/* Card body */}
        <div className="flex flex-col gap-1.5 p-4 pr-12">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`mt-0.5 h-2 w-2 shrink-0 rounded-full ${STATUS_DOT[status] ?? "bg-muted"}`}
              title={status}
            />
            <h3 className="font-semibold leading-snug">{title}</h3>
            {isPublic && (
              <span className="rounded-full bg-emerald-500/10 border border-emerald-500/30 px-1.5 py-0.5 text-[10px] font-medium text-emerald-400">
                🌐 Public
              </span>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
            {eventDate && (
              <span className="flex items-center gap-1">
                <CalendarDays className="h-3 w-3 text-violet-400" />
                {new Date(eventDate).toLocaleDateString(undefined, {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            )}
            {location && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3 text-violet-400" />
                {location}
              </span>
            )}
            {category && (
              <span className="flex items-center gap-1">
                <Tag className="h-3 w-3 text-violet-400" />
                {category}
              </span>
            )}
            {!eventDate && !location && !category && (
              <span className="italic opacity-40">No date or location set</span>
            )}
          </div>
        </div>

        {/* Card footer */}
        <div className="flex items-center justify-between gap-3 border-t border-border px-4 py-3">
          {total === 0 ? (
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Users className="h-3.5 w-3.5" />
              No responses yet
            </span>
          ) : (
            <>
              <div className="flex items-center gap-1.5">
                <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-400">
                  <CheckCircle2 className="h-3 w-3" />
                  {goingCount}
                </span>
                <span className="flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[11px] font-medium text-amber-400">
                  <HelpCircle className="h-3 w-3" />
                  {maybeCount}
                </span>
                <span className="flex items-center gap-1 rounded-full bg-red-500/10 px-2 py-0.5 text-[11px] font-medium text-red-400">
                  <XCircle className="h-3 w-3" />
                  {notGoingCount}
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <div
                  className="h-1 w-16 overflow-hidden rounded-full bg-border"
                >
                  <div
                    className="h-full rounded-full bg-violet-500 transition-all duration-500"
                    style={{ width: `${goingPct}%` }}
                  />
                </div>
                <span className="text-[11px] tabular-nums text-muted-foreground">
                  {Math.round(goingPct)}%
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      <ConfirmDeleteModal
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={handleDeleteConfirm}
      />
    </>
  );
};
