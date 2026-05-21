import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth/server";
import { prisma } from "@/lib/prisma";
import { EventForm } from "@/components/event-form";
import { ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function EditEventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session.data) redirect("/auth/sign-in");

  const { id } = await params;

  const event = await prisma.event.findFirst({
    where: { id, ownerUserId: session.data.user.id },
    select: {
      id: true,
      title: true,
      description: true,
      content: true,
      coverImage: true,
      location: true,
      category: true,
      capacity: true,
      status: true,
      isPublic: true,
      eventDate: true,
      endDate: true,
    },
  });

  if (!event) notFound();

  return (
    <div className="flex flex-col gap-8 pb-16">
      <div>
        <Link
          href={`/events/${id}`}
          className="flex w-fit items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground mb-4"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to event
        </Link>

        <h1 className="text-2xl font-bold tracking-tight">Edit Event</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Changes are saved immediately when you click &ldquo;Save changes&rdquo;.
        </p>
      </div>

      <EventForm
        mode="edit"
        eventId={id}
        defaultValues={{
          title: event.title,
          description: event.description,
          content: event.content,
          coverImage: event.coverImage,
          location: event.location,
          category: event.category,
          capacity: event.capacity,
          status: event.status,
          isPublic: event.isPublic,
          eventDate: event.eventDate?.toISOString() ?? null,
          endDate: event.endDate?.toISOString() ?? null,
        }}
      />
    </div>
  );
}
