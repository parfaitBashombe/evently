import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/server";
import { DashboardContent } from "@/components/dashboard-content";

export const dynamic = "force-dynamic";

const DashboardPage = async () => {
  const session = await getSession();
  if (!session.data) redirect("/auth/sign-in");

  return (
    <div className="max-w-5xl mx-auto w-full px-4 md:px-10 py-10 flex flex-col flex-1">
      <DashboardContent userId={session.data.user.id} />
    </div>
  );
};

export default DashboardPage;
