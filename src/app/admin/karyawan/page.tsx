import Link from "next/link";
import { UserPlus, ChevronRight } from "lucide-react";
import { employees } from "@/lib/db";
import { ROLE_LEVEL, ROLE_LABEL, DEPARTMENT_LABEL } from "@/lib/types";
import { Card, PageHeader } from "@/components/card";
import { Avatar } from "@/components/avatar";

export default async function AdminKaryawanPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const showInactive = status === "nonaktif";

  const list = employees
    .filter((e) => e.isActive !== showInactive)
    .sort((a, b) => ROLE_LEVEL[a.role] - ROLE_LEVEL[b.role] || a.name.localeCompare(b.name));

  return (
    <div>
      <PageHeader
        title="Kelola Karyawan"
        description={`${list.length} karyawan ${showInactive ? "nonaktif" : "aktif"} — akses penuh sebagai Admin.`}
        action={
          <Link
            href="/admin/karyawan/baru"
            className="inline-flex items-center gap-2 rounded-[10px] bg-primary text-primary-foreground px-4 py-2.5 text-sm font-medium hover:bg-primary-soft transition-colors"
          >
            <UserPlus className="h-4 w-4" strokeWidth={1.75} />
            Tambah Karyawan
          </Link>
        }
      />

      <div className="mb-4 flex gap-2">
        <Link
          href="/admin/karyawan"
          className={`rounded-[8px] border px-3 py-1.5 text-xs font-medium transition-colors ${
            !showInactive
              ? "bg-primary text-primary-foreground border-primary"
              : "border-border bg-surface hover:bg-surface-muted"
          }`}
        >
          Aktif
        </Link>
        <Link
          href="/admin/karyawan?status=nonaktif"
          className={`rounded-[8px] border px-3 py-1.5 text-xs font-medium transition-colors ${
            showInactive
              ? "bg-primary text-primary-foreground border-primary"
              : "border-border bg-surface hover:bg-surface-muted"
          }`}
        >
          Nonaktif
        </Link>
      </div>

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
                <th className="pb-2 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {list.map((e) => (
                <tr key={e.id} className="hover:bg-surface-muted transition-colors">
                  <td className="py-2.5">
                    <Link href={`/admin/karyawan/${e.id}`} className="flex items-center gap-2.5">
                      <Avatar name={e.name} avatarColor={e.avatarColor} avatarPhoto={e.avatarPhoto} size="xs" />
                      {e.name}
                    </Link>
                  </td>
                  <td className="py-2.5 font-mono text-muted-foreground">
                    <Link href={`/admin/karyawan/${e.id}`}>{e.nip}</Link>
                  </td>
                  <td className="py-2.5">
                    <Link href={`/admin/karyawan/${e.id}`}>{e.jobTitle}</Link>
                  </td>
                  <td className="py-2.5 text-muted-foreground">
                    <Link href={`/admin/karyawan/${e.id}`}>{DEPARTMENT_LABEL[e.department]}</Link>
                  </td>
                  <td className="py-2.5">
                    <Link href={`/admin/karyawan/${e.id}`}>{ROLE_LABEL[e.role]}</Link>
                  </td>
                  <td className="py-2.5 text-right">
                    <Link href={`/admin/karyawan/${e.id}`}>
                      <ChevronRight className="h-4 w-4 text-muted-foreground inline" strokeWidth={1.75} />
                    </Link>
                  </td>
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
