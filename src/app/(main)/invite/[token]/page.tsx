import { redirect } from "next/navigation";

const InvitePage = async ({
  params,
}: {
  params: Promise<{ token: string }>;
}) => {
  const { token } = await params;
  redirect(`/e/${token}`);
};

export default InvitePage;
