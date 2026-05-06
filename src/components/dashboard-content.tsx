/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { CreateEventModal } from "@/components/create-event-modal";
import { EventCard } from "@/components/event-card";
import { DashboardSkeleton } from "@/components/dashboard-skeleton";
import { RefreshCw, CalendarPlus } from "lucide-react";

interface Event {
  id: string;
  title: string;
  eventDate: string | null;
  location: string | null;
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

  return (
    <div className="flex flex-1 flex-col gap-10 pb-16">
      {/* ── Page header ── */}
      <div className="relative flex flex-wrap items-end justify-between gap-4 pt-10">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-10 -left-10 h-64 w-64 rounded-full blur-3xl opacity-10"
          style={{ background: "#955fff" }}
        />
        <div className="flex flex-col gap-1">
          <Badge variant="secondary" className="w-fit mb-1">
            Dashboard
          </Badge>
          <h1
            className="text-4xl font-black tracking-tight"
            style={{
              background: "linear-gradient(135deg, #ffffff 30%, #c084fc 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Your Events
          </h1>
          <p className="text-sm text-muted-foreground">
            Track attendee responses and manage invite links.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <CreateEventModal onSuccess={handleRefetch} />
          <Button
            size="sm"
            variant="outline"
            className="border-white/10 gap-1.5"
            onClick={handleRefetch}
            disabled={isRefreshing}
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`}
            />
            Reload
          </Button>
        </div>
      </div>

      {/* ── Stats bar ── */}
      {!initialLoading && events.length > 0 && (
        <section
          className="rounded-2xl px-8 py-8"
          style={{
            background: "rgba(149,95,255,0.06)",
            border: "1px solid rgba(149,95,255,0.15)",
          }}
        >
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {[
              { value: events.length, label: "Total events" },
              { value: totalGoing, label: "Going" },
              { value: totalMaybe, label: "Maybe" },
              { value: totalNotGoing, label: "Not going" },
            ].map(({ value, label }) => (
              <div
                key={label}
                className="flex flex-col items-center gap-1 text-center"
              >
                <span
                  className="text-4xl font-black tracking-tight"
                  style={{
                    background: "linear-gradient(135deg, #955fff, #c084fc)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  {value}
                </span>
                <span className="text-sm text-muted-foreground">{label}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Content area ── */}
      {initialLoading ? (
        <DashboardSkeleton />
      ) : events.length === 0 ? (
        <div
          className="relative overflow-hidden rounded-2xl px-8 py-20 text-center"
          style={{
            background:
              "linear-gradient(135deg, #1a0f2e 0%, #16161f 60%, #0f1a2e 100%)",
            border: "1px solid rgba(149,95,255,0.2)",
          }}
        >
          <div
            aria-hidden
            className="pointer-events-none absolute -top-8 left-1/3 h-48 w-48 rounded-full blur-3xl opacity-25"
            style={{ background: "#955fff" }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-8 right-1/3 h-48 w-48 rounded-full blur-3xl opacity-15"
            style={{ background: "#6366f1" }}
          />
          <div className="relative flex flex-col items-center gap-4">
            <span
              className="flex h-14 w-14 items-center justify-center rounded-2xl"
              style={{ background: "rgba(149,95,255,0.15)" }}
            >
              <CalendarPlus className="h-7 w-7 text-violet-400" />
            </span>
            <h2 className="text-2xl font-bold tracking-tight">No events yet</h2>
            <p className="max-w-sm text-muted-foreground text-sm">
              Create your first event and start collecting RSVPs in under a
              minute.
            </p>
            <div className="mt-2">
              <CreateEventModal onSuccess={handleRefetch} />
            </div>
          </div>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          {events.map((event) => (
            <EventCard key={event.id} {...event} />
          ))}
        </div>
      )}
    </div>
  );
};
