import { redirect } from "next/navigation";
import { getCurrentActor } from "@/lib/current-actor";
import { AdminSidebar } from "@/components/admin-sidebar";
import { AdminTopbar } from "@/components/admin-topbar";
import { AdminBottomNav } from "@/components/admin-bottom-nav";
import { ActivityTracker } from "@/components/activity-tracker";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const actor = await getCurrentActor();

  if (!actor) redirect("/login");
  if (actor.type !== "admin") redirect("/dashboard");

  return (
    <>
      <ActivityTracker />
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-[8px] focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:text-primary-foreground"
      >
        Langsung ke konten
      </a>
      <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <AdminTopbar name={actor.admin.name} />
        <main id="main-content" className="flex-1 p-4 sm:p-6 lg:p-8 pb-24 md:pb-8 max-w-6xl w-full mx-auto">
          {children}
        </main>
      </div>
      <AdminBottomNav />
    </div>
    </>
  );
}
