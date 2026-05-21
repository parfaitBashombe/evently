import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth/server";
import { prisma } from "@/lib/prisma";
import { EventForm } from "@/components/event-form";
import { FaArrowLeft } from "react-icons/fa6";

export const dynamic = "force-dynamic";

export default async function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session.data) redirect("/auth/sign-in");

  const { id } = await params;

  const event = await prisma.event.findFirst({
    where: { id, ownerUserId: session.data.user.id },
    select: {
      id: true, title: true, description: true, content: true,
      coverImage: true, location: true, category: true, capacity: true,
      status: true, isPublic: true, eventDate: true, endDate: true,
    },
  });

  if (!event) notFound();

  return (
    <div className="max-w-3xl mx-auto w-full px-4 md:px-10 py-10 flex flex-col gap-8 pb-16">
      <div>
        <Link
          href={`/events/${id}`}
          className="flex w-fit items-center gap-1.5 text-sm text-white/40 transition-colors hover:text-white/80 mb-5"
        >
          <FaArrowLeft className="h-3.5 w-3.5" />
          Back to event
        </Link>
        <h1 className="text-2xl font-extrabold tracking-tight text-white">Edit Event</h1>
        <p className="text-sm text-white/45 mt-1">
          Changes are saved when you click &ldquo;Save changes&rdquo;.
        </p>
      </div>
      <EventForm
        mode="edit"
        eventId={id}
        defaultValues={{
          title: event.title, description: event.description, content: event.content,
          coverImage: event.coverImage, location: event.location, category: event.category,
          capacity: event.capacity, status: event.status, isPublic: event.isPublic,
          eventDate: event.eventDate?.toISOString() ?? null,
          endDate: event.endDate?.toISOString() ?? null,
        }}
      />
    </div>
  );
}
