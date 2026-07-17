import Link from "next/link";
import { redirect } from "next/navigation";
import { UserPlus, ChevronRight } from "lucide-react";
import { getCurrentEmployee } from "@/lib/current-employee";
import { employees, getSubordinateIds } from "@/lib/db";
import { canManageEmployees } from "@/lib/permissions";
import { ROLE_LEVEL, ROLE_LABEL, DEPARTMENT_LABEL } from "@/lib/types";
import { Card, PageHeader } from "@/components/card";
import { Avatar } from "@/components/avatar";

export default async function KaryawanPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const employee = await getCurrentEmployee();
  if (!employee) return null;

  const isApproverLevel = ROLE_LEVEL[employee.role] <= ROLE_LEVEL.supervisor;
  if (!isApproverLevel) redirect("/dashboard");

  const isManager = canManageEmployees(employee);
  const { status } = await searchParams;
  const showInactive = isManager && status === "nonaktif";

  // HR Manager (walau bukan Owner/Direktur) tetap harus lihat SEMUA karyawan
  // kalau dia punya wewenang kelola karyawan — itu memang fungsi jabatannya,
  // beda dengan manager departemen lain yang cuma lihat sub-tree tim sendiri.
  const seesAll = employee.role === "owner" || employee.role === "direktur" || isManager;
  const visibleIds = seesAll ? null : getSubordinateIds(employee.id);
  const list = employees
    .filter((e) => e.id !== employee.id && (seesAll || visibleIds?.has(e.id)))
    .filter((e) => e.isActive !== showInactive)
    .sort((a, b) => ROLE_LEVEL[a.role] - ROLE_LEVEL[b.role] || a.name.localeCompare(b.name));

  return (
    <div>
      <PageHeader
        title="Direktori Karyawan"
        description={`${list.length} karyawan ${showInactive ? "nonaktif" : "aktif"} dalam ruang lingkupmu.`}
        action={
          isManager ? (
            <Link
              href="/karyawan/baru"
              className="inline-flex items-center gap-2 rounded-[10px] bg-primary text-primary-foreground px-4 py-2.5 text-sm font-medium hover:bg-primary-soft transition-colors"
            >
              <UserPlus className="h-4 w-4" strokeWidth={1.75} />
              Tambah Karyawan
            </Link>
          ) : undefined
        }
      />

      {isManager && (
        <div className="mb-4 flex gap-2">
          <Link
            href="/karyawan"
            className={`rounded-[8px] border px-3 py-1.5 text-xs font-medium transition-colors ${
              !showInactive
                ? "bg-primary text-primary-foreground border-primary"
                : "border-border bg-surface hover:bg-surface-muted"
            }`}
          >
            Aktif
          </Link>
          <Link
            href="/karyawan?status=nonaktif"
            className={`rounded-[8px] border px-3 py-1.5 text-xs font-medium transition-colors ${
              showInactive
                ? "bg-primary text-primary-foreground border-primary"
                : "border-border bg-surface hover:bg-surface-muted"
            }`}
          >
            Nonaktif
          </Link>
        </div>
      )}

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-muted-foreground border-b border-border">
                <th className="pb-2 font-medium">Nama</th>
                <th className="pb-2 font-medium">NIP</th>
                <th className="pb-2 font-medium">Jabatan</th>
                <th className="pb-2 font-medium">Departemen</th>
                <th className="pb-2 font-medium">Role</th>
                {isManager && <th className="pb-2 font-medium"></th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {list.map((e) => (
                <tr key={e.id} className={isManager ? "hover:bg-surface-muted transition-colors" : ""}>
                  {isManager ? (
                    <>
                      <td className="py-2.5">
                        <Link href={`/karyawan/${e.id}`} className="flex items-center gap-2.5">
                          <Avatar name={e.name} avatarColor={e.avatarColor} avatarPhoto={e.avatarPhoto} size="xs" />
                          {e.name}
                        </Link>
                      </td>
                      <td className="py-2.5 font-mono text-muted-foreground">
                        <Link href={`/karyawan/${e.id}`}>{e.nip}</Link>
                      </td>
                      <td className="py-2.5">
                        <Link href={`/karyawan/${e.id}`}>{e.jobTitle}</Link>
                      </td>
                      <td className="py-2.5 text-muted-foreground">
                        <Link href={`/karyawan/${e.id}`}>{DEPARTMENT_LABEL[e.department]}</Link>
                      </td>
                      <td className="py-2.5">
                        <Link href={`/karyawan/${e.id}`}>{ROLE_LABEL[e.role]}</Link>
                      </td>
                      <td className="py-2.5 text-right">
                        <Link href={`/karyawan/${e.id}`}>
                          <ChevronRight className="h-4 w-4 text-muted-foreground inline" strokeWidth={1.75} />
                        </Link>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="py-2.5 flex items-center gap-2.5">
                        <Avatar name={e.name} avatarColor={e.avatarColor} avatarPhoto={e.avatarPhoto} size="xs" />
                        {e.name}
                      </td>
                      <td className="py-2.5 font-mono text-muted-foreground">{e.nip}</td>
                      <td className="py-2.5">{e.jobTitle}</td>
                      <td className="py-2.5 text-muted-foreground">
                        {DEPARTMENT_LABEL[e.department]}
                      </td>
                      <td className="py-2.5">{ROLE_LABEL[e.role]}</td>
                    </>
                  )}
                </tr>
              ))}
              {list.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-muted-foreground">
                    Tidak ada karyawan {showInactive ? "nonaktif" : "aktif"} yang ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
