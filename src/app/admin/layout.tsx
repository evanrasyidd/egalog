import { redirect } from "next/navigation";
import { getCurrentActor } from "@/lib/current-actor";
import { AdminSidebar } from "@/components/admin-sidebar";
import { AdminTopbar } from "@/components/admin-topbar";
import { AdminBottomNav } from "@/components/admin-bottom-nav";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const actor = await getCurrentActor();

  if (!actor) redirect("/login");
  if (actor.type !== "admin") redirect("/dashboard");

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <AdminTopbar name={actor.admin.name} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-24 md:pb-8 max-w-6xl w-full mx-auto">
          {children}
        </main>
      </div>
      <AdminBottomNav />
    </div>
  );
}
