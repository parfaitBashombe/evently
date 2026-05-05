import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { ConfirmDeleteModal } from "./confirm-delete-modal";
import { deleteEventAction } from "@/lib/actions/events";
import {
  CalendarDays,
  MapPin,
  Users,
  CheckCircle2,
  HelpCircle,
  XCircle,
  Trash2,
  Eye,
} from "lucide-react";
import { EventDetailModal } from "./event-detail-moal";

interface EventCardProps {
  id: string;
  title: string;
  eventDate: string | null;
  location: string | null;
  goingCount: number;
  maybeCount: number;
  notGoingCount: number;
  onDelete?: () => void;
  onEventUpdated?: () => void; // refresh dashboard after edit
}

export const EventCard = ({
  id,
  title,
  eventDate,
  location,
  goingCount,
  maybeCount,
  notGoingCount,
  onDelete,
  onEventUpdated,
}: EventCardProps) => {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const total = goingCount + maybeCount + notGoingCount;
  const goingPct = total > 0 ? (goingCount / total) * 100 : 0;

  const handleDeleteConfirm = async () => {
    await deleteEventAction(id);
    onDelete?.();
  };

  return (
    <Card className="group relative overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -top-px h-px opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background:
            "linear-gradient(90deg, transparent, #955fff, transparent)",
        }}
      />

      <CardHeader className="gap-4 pb-3">
        <div className="flex items-start justify-between gap-3">
          <CardTitle className="text-lg leading-snug">{title}</CardTitle>
          <div className="flex items-center gap-1.5 shrink-0">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setDetailOpen(true)}
              className="gap-1.5"
            >
              <Eye className="h-3.5 w-3.5" />
              Details
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 text-muted-foreground hover:text-red-400 hover:bg-red-500/10"
              onClick={() => setDeleteOpen(true)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
          {eventDate && (
            <span className="flex items-center gap-1.5">
              <CalendarDays className="h-3.5 w-3.5 text-violet-400" />
              {new Date(eventDate).toLocaleDateString(undefined, {
                weekday: "short",
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </span>
          )}
          {location && (
            <span className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-violet-400" />
              {location}
            </span>
          )}
          {!eventDate && !location && (
            <span className="italic opacity-50">No date or location set</span>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-4 pt-0">
        <div className="flex flex-wrap gap-2">
          <span
            className="flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium"
            style={{ background: "rgba(52,211,153,0.12)", color: "#34d399" }}
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            {goingCount} Going
          </span>
          <span
            className="flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium"
            style={{ background: "rgba(251,191,36,0.12)", color: "#fbbf24" }}
          >
            <HelpCircle className="h-3.5 w-3.5" />
            {maybeCount} Maybe
          </span>
          <span
            className="flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium"
            style={{ background: "rgba(248,113,113,0.12)", color: "#f87171" }}
          >
            <XCircle className="h-3.5 w-3.5" />
            {notGoingCount} Not going
          </span>
        </div>

        {total === 0 ? (
          <div className="flex items-center gap-2 text-xs text-muted-foreground py-2">
            <Users className="h-3.5 w-3.5 text-violet-400/60" />
            <span>0 responses yet</span>
          </div>
        ) : (
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Users className="h-3 w-3" /> {total} response
                {total !== 1 ? "s" : ""}
              </span>
              <span>{Math.round(goingPct)}% going</span>
            </div>
            <div
              className="h-1.5 w-full overflow-hidden rounded-full"
              style={{ background: "rgba(255,255,255,0.07)" }}
            >
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${goingPct}%`,
                  background: "linear-gradient(90deg, #955fff, #34d399)",
                }}
              />
            </div>
          </div>
        )}
      </CardContent>

      <ConfirmDeleteModal
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={handleDeleteConfirm}
      />

      <EventDetailModal
        eventId={id}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        onEventUpdated={onEventUpdated}
      />
    </Card>
  );
};
