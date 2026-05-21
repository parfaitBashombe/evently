import { DashboardContent } from "@/components/dashboard-content";
import { getSession } from "@/lib/auth/server";

const DashboardPage = async () => {
  const session = await getSession();
  if (!session.data) {
    return null;
  }
  return <DashboardContent userId={session.data.user.id} />;
};

export default DashboardPage;
