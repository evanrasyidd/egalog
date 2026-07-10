import { redirect, notFound } from "next/navigation";
import { getCurrentEmployee } from "@/lib/current-employee";
import { canManageEmployees } from "@/lib/permissions";
import { employees, findEmployeeById, getSubordinateIds } from "@/lib/db";
import { ROLE_LABEL, DEPARTMENT_LABEL } from "@/lib/types";
import { Card, PageHeader } from "@/components/card";
import { BackLink } from "@/components/back-link";
import { Avatar } from "@/components/avatar";
import { StatusBadge } from "@/components/status-badge";
import { EditEmployeeForm } from "@/components/edit-employee-form";
import { EmployeeStatusAction, ResetPasswordAction } from "@/components/employee-actions";

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default async function EmployeeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const actor = await getCurrentEmployee();
  if (!actor) return null;
  if (!canManageEmployees(actor)) redirect("/dashboard");

  const { id } = await params;
  const target = findEmployeeById(id);
  if (!target) notFound();

  // Opsi atasan: semua karyawan aktif KECUALI diri sendiri & bawahannya
  // sendiri (biar nggak bisa milih opsi yang bakal ditolak server karena
  // membentuk siklus — validasi asli tetap di server, ini cuma UX preventif).
  const subordinateIds = getSubordinateIds(id);
  const managerOptions = employees
    .filter((e) => e.isActive && e.id !== id && !subordinateIds.has(e.id))
    .map((e) => ({ id: e.id, name: e.name, jobTitle: e.jobTitle }))
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div>
      <BackLink href="/karyawan" label="Kembali ke Direktori Karyawan" />

      <PageHeader
        title={target.name}
        description={`${target.jobTitle} · ${ROLE_LABEL[target.role]}`}
        action={<StatusBadge status={target.isActive ? "aktif" : "nonaktif"} />}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="space-y-5">
          <Card>
            <div className="flex items-center gap-4 mb-5">
              <Avatar
                name={target.name}
                avatarColor={target.avatarColor}
                avatarPhoto={target.avatarPhoto}
                size="lg"
              />
              <div>
                <p className="text-base font-semibold">{target.name}</p>
                <p className="text-sm text-muted-foreground">{target.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm border-t border-border pt-4">
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">NIP</p>
                <p className="font-mono">{target.nip}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Departemen</p>
                <p>{DEPARTMENT_LABEL[target.department]}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Tanggal Bergabung</p>
                <p>{formatDate(target.joinedAt)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Sisa Cuti Tahunan</p>
                <p className="font-mono">{target.leaveBalance} hari</p>
              </div>
            </div>
          </Card>

          <Card>
            <h2 className="text-sm font-medium mb-4">Status Akun</h2>
            <EmployeeStatusAction employeeId={target.id} isActive={target.isActive} />
          </Card>

          <Card>
            <h2 className="text-sm font-medium mb-1">Reset Password</h2>
            <p className="text-xs text-muted-foreground mb-3">
              Generate password sementara baru — dipakai kalau karyawan lupa password.
            </p>
            <ResetPasswordAction employeeId={target.id} />
          </Card>
        </div>

        <Card>
          <h2 className="text-sm font-medium mb-4">Edit Data Karyawan</h2>
          <EditEmployeeForm
            employeeId={target.id}
            initialJobTitle={target.jobTitle}
            initialDepartment={target.department}
            initialRole={target.role}
            initialManagerId={target.managerId}
            managerOptions={managerOptions}
          />
        </Card>
      </div>
    </div>
  );
}
