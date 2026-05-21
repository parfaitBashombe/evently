import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/server";
import { EventForm } from "@/components/event-form";
import { CalendarPlus } from "lucide-react";

export const metadata = { title: "New Event — Evently" };

export default async function NewEventPage() {
  const session = await getSession();
  if (!session.data) redirect("/auth/sign-in");

  return (
    <div className="flex flex-col gap-8 pb-16">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/10">
            <CalendarPlus className="h-4 w-4 text-violet-400" />
          </span>
          <h1 className="text-2xl font-bold tracking-tight">New Event</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Fill in the details and publish when you&apos;re ready.
        </p>
      </div>

      <EventForm mode="create" />
    </div>
  );
}
