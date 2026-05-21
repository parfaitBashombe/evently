"use client";

import { useEffect, useState, useCallback } from "react";
import { EventCard } from "@/components/event-card";
import { CreateEventModal } from "@/components/create-event-modal";
import { EventDetailModal } from "@/components/event-detail-moal";
import { DashboardSkeleton } from "@/components/dashboard-skeleton";
import { CalendarPlus, RefreshCw, CalendarDays, Users, TrendingUp, LayoutGrid } from "lucide-react";

interface Event {
  id: string;
  title: string;
  eventDate: string | null;
  location: string | null;
  category: string | null;
  status: string;
  isPublic: boolean;
  goingCount: number;
  maybeCount: number;
  notGoingCount: number;
}

export const DashboardContent = ({ userId }: { userId: string }) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [detailEventId, setDetailEventId] = useState<string | null>(null);

  const fetchEvents = useCallback(async () => {
    try {
      const response = await fetch("/api/events");
      if (!response.ok) throw new Error("Failed to fetch events");
      setEvents(await response.json());
    } catch (error) {
      console.error("Failed to fetch events", error);
    } finally {
      setInitialLoading(false);
      setIsRefreshing(false);
    }
  }, [userId]);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  const handleRefetch = () => { setIsRefreshing(true); fetchEvents(); };

  const totalGoing = events.reduce((s, e) => s + e.goingCount, 0);
  const totalMaybe = events.reduce((s, e) => s + e.maybeCount, 0);
  const totalEvents = events.length;
  const publishedEvents = events.filter((e) => e.status === "published").length;

  return (
    <>
      <div className="flex flex-1 flex-col gap-8 pb-16">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-extrabold tracking-tight text-white">Your Events</h1>
            <p className="text-sm text-white/45">Manage your events and track RSVPs in real-time.</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleRefetch}
              disabled={isRefreshing}
              className="flex h-9 items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-white/55 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-40"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
            </button>
            <button
              onClick={() => setCreateOpen(true)}
              className="flex h-9 items-center gap-1.5 rounded-xl px-4 text-sm font-bold text-white transition-all hover:shadow-[0_0_20px_4px_rgba(0,74,198,0.35)] active:scale-95"
              style={{ background: "linear-gradient(135deg, #004ac6, #6d28d9)" }}
            >
              <CalendarPlus className="h-3.5 w-3.5" />
              New event
            </button>
          </div>
        </div>

        {/* Stats */}
        {!initialLoading && totalEvents > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Total events", value: totalEvents, icon: LayoutGrid, color: "text-[#60a5fa]", glow: "rgba(96,165,250,0.12)" },
              { label: "Published", value: publishedEvents, icon: TrendingUp, color: "text-emerald-400", glow: "rgba(52,211,153,0.12)" },
              { label: "Going", value: totalGoing, icon: Users, color: "text-emerald-400", glow: "rgba(52,211,153,0.12)" },
              { label: "Maybe", value: totalMaybe, icon: CalendarDays, color: "text-amber-400", glow: "rgba(251,191,36,0.12)" },
            ].map(({ label, value, icon: Icon, color, glow }) => (
              <div
                key={label}
                className="flex flex-col gap-3 rounded-2xl border border-white/8 bg-[#0e1528] p-4"
              >
                <span
                  className="flex h-8 w-8 items-center justify-center rounded-xl"
                  style={{ background: glow }}
                >
                  <Icon className={`h-4 w-4 ${color}`} />
                </span>
                <div>
                  <p className={`text-2xl font-extrabold tabular-nums ${color}`}>{value}</p>
                  <p className="text-xs text-white/35 mt-0.5">{label}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Content */}
        {initialLoading ? (
          <DashboardSkeleton />
        ) : events.length === 0 ? (
          <div className="flex flex-col items-center gap-5 rounded-3xl border border-white/8 bg-[#0e1528] px-8 py-20 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#004ac6]/20">
              <CalendarDays className="h-7 w-7 text-[#60a5fa]" />
            </span>
            <div className="flex flex-col gap-1.5">
              <h2 className="text-lg font-bold text-white">No events yet</h2>
              <p className="text-sm text-white/40 max-w-xs">
                Create your first event and start collecting RSVPs in under a minute.
              </p>
            </div>
            <button
              onClick={() => setCreateOpen(true)}
              className="flex items-center gap-1.5 rounded-xl px-5 py-2.5 text-sm font-bold text-white transition-all hover:shadow-lg active:scale-95"
              style={{ background: "linear-gradient(135deg, #004ac6, #6d28d9)" }}
            >
              <CalendarPlus className="h-3.5 w-3.5" />
              New event
            </button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {events.map((event) => (
              <EventCard
                key={event.id}
                {...event}
                onDelete={handleRefetch}
                onEventUpdated={handleRefetch}
                onOpen={setDetailEventId}
              />
            ))}
          </div>
        )}
      </div>

      <CreateEventModal
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSuccess={() => { setCreateOpen(false); handleRefetch(); }}
      />
      <EventDetailModal
        eventId={detailEventId}
        open={detailEventId !== null}
        onOpenChange={(v) => { if (!v) setDetailEventId(null); }}
        onEventUpdated={handleRefetch}
      />
    </>
  );
};
