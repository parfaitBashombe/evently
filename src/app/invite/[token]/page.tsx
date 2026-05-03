import { InviteRsvpContent } from "@/components/invite-rsvp-content";

const InvitePage = async ({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ submitted?: string }>;
}) => {
  const { token } = await params;
  const query = await searchParams;

  return (
    <InviteRsvpContent token={token} submitted={query.submitted === "1"} />
  );
};

export default InvitePage;
