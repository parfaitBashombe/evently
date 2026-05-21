"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Button } from "./ui/button";
import { EventCard } from "@/components/event-card";
import { DashboardSkeleton } from "@/components/dashboard-skeleton";
import { CalendarPlus, RefreshCw, CalendarDays } from "lucide-react";

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

  const fetchEvents = useCallback(async () => {
    try {
      const response = await fetch("/api/events");
      if (!response.ok) throw new Error("Failed to fetch events");
      const data = await response.json();
      setEvents(data);
    } catch (error) {
      console.error("Failed to fetch events", error);
    } finally {
      setInitialLoading(false);
      setIsRefreshing(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleRefetch = () => {
    setIsRefreshing(true);
    fetchEvents();
  };

  const totalGoing = events.reduce((s, e) => s + e.goingCount, 0);
  const totalMaybe = events.reduce((s, e) => s + e.maybeCount, 0);
  const totalNotGoing = events.reduce((s, e) => s + e.notGoingCount, 0);
  const totalEvents = events.length;

  return (
    <div className="flex flex-1 flex-col gap-8 pb-16">
      {/* ── Header ── */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight">Your Events</h1>
          {!initialLoading && totalEvents > 0 && (
            <p className="text-sm text-muted-foreground">
              {totalEvents} {totalEvents === 1 ? "event" : "events"}
              {" · "}
              <span className="text-emerald-400">{totalGoing} going</span>
              {" · "}
              <span className="text-amber-400">{totalMaybe} maybe</span>
              {" · "}
              <span className="text-red-400">{totalNotGoing} not going</span>
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={handleRefetch}
            disabled={isRefreshing}
            className="text-muted-foreground"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`}
            />
          </Button>
          <Link href="/events/new">
            <Button size="sm">
              <CalendarPlus className="h-3.5 w-3.5" />
              New event
            </Button>
          </Link>
        </div>
      </div>

      {/* ── Content ── */}
      {initialLoading ? (
        <DashboardSkeleton />
      ) : events.length === 0 ? (
        <div className="flex flex-col items-center gap-5 rounded-2xl border border-border bg-card px-8 py-20 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-500/10">
            <CalendarDays className="h-6 w-6 text-violet-400" />
          </span>
          <div className="flex flex-col gap-1.5">
            <h2 className="text-lg font-semibold">No events yet</h2>
            <p className="text-sm text-muted-foreground max-w-xs">
              Create your first event and start collecting RSVPs in under a
              minute.
            </p>
          </div>
          <Link href="/events/new">
            <Button size="sm">
              <CalendarPlus className="h-3.5 w-3.5" />
              New event
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {events.map((event) => (
            <EventCard
              key={event.id}
              {...event}
              onDelete={handleRefetch}
              onEventUpdated={handleRefetch}
            />
          ))}
        </div>
      )}
    </div>
  );
};
