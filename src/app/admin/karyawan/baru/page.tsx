import { employees } from "@/lib/db";
import { Card, PageHeader } from "@/components/card";
import { BackLink } from "@/components/back-link";
import { NewEmployeeForm } from "@/components/new-employee-form";

export default async function AdminNewEmployeePage() {
  const managerOptions = employees
    .filter((e) => e.isActive)
    .map((e) => ({ id: e.id, name: e.name, jobTitle: e.jobTitle }))
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div>
      <BackLink href="/admin/karyawan" label="Kembali ke Kelola Karyawan" />
      <PageHeader
        title="Tambah Karyawan Baru"
        description="Akun akan dibuat dengan password sementara yang wajib diganti karyawan setelah login pertama."
      />
      <Card>
        <NewEmployeeForm managerOptions={managerOptions} />
      </Card>
    </div>
  );
}
