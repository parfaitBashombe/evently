import { EventDetailContent } from "@/components/event-detail-content";
import { getSession } from "@/lib/auth/server";

const EventDetailsPage = async ({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) => {
  const { eventId } = await params;

  const session = await getSession();

  if (!session.data) {
    return null;
  }

  return <EventDetailContent userId={session.data.user.id} eventId={eventId} />;
};

export default EventDetailsPage;
