import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth/server";
import { EventForm } from "@/components/event-form";
import { FaArrowLeft } from "react-icons/fa6";

export const dynamic = "force-dynamic";

export default async function NewEventPage() {
  const session = await getSession();
  if (!session.data) redirect("/auth/sign-in");

  return (
    <div className="max-w-3xl mx-auto w-full px-4 md:px-10 py-10 flex flex-col gap-8 pb-16">
      <div>
        <Link
          href="/dashboard"
          className="flex w-fit items-center gap-1.5 text-sm text-white/40 transition-colors hover:text-white/80 mb-5"
        >
          <FaArrowLeft className="h-3.5 w-3.5" />
          Dashboard
        </Link>
        <h1 className="text-2xl font-extrabold tracking-tight text-white">Create a new event</h1>
        <p className="text-sm text-white/45 mt-1">
          Fill in the details below. You can always edit after creating.
        </p>
      </div>
      <EventForm mode="create" />
    </div>
  );
}
