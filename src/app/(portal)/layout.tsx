import { redirect } from "next/navigation";
import { getCurrentEmployee } from "@/lib/current-employee";
import { ROLE_LEVEL } from "@/lib/types";
import { canManagePayroll } from "@/lib/permissions";
import { Sidebar } from "@/components/sidebar";
import { Topbar } from "@/components/topbar";
import { BottomNav } from "@/components/bottom-nav";

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const employee = await getCurrentEmployee();
  if (!employee) {
    // Null di sini bisa berarti: belum login, ATAU sesi JWT-nya masih valid
    // tapi akunnya baru saja di-nonaktifkan HR (atau ini sesi Admin, yang
    // memang bukan Employee — Admin punya nested layout sendiri di
    // src/app/admin/, proxy.ts yang mengarahkan Admin ke sana). Kita TIDAK
    // bisa memanggil destroySession() di sini — Next.js hanya mengizinkan
    // modifikasi cookie dari Server Action atau Route Handler, bukan dari
    // Server Component biasa saat render.
    redirect("/login");
  }

  const isApproverLevel = ROLE_LEVEL[employee.role] <= ROLE_LEVEL.supervisor;
  const isManagementLevel = ROLE_LEVEL[employee.role] <= ROLE_LEVEL.manager;
  const isPayrollManager = canManagePayroll(employee);
  const navAccess = { isApproverLevel, isManagementLevel, isPayrollManager };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar {...navAccess} />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar employee={employee} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-24 md:pb-8 max-w-6xl w-full mx-auto">
          {children}
        </main>
      </div>
      <BottomNav {...navAccess} />
    </div>
  );
}
