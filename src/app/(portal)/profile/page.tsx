import { getCurrentEmployee } from "@/lib/current-employee";
import { findEmployeeById } from "@/lib/db";
import { ROLE_LABEL, DEPARTMENT_LABEL } from "@/lib/types";
import { Card, PageHeader } from "@/components/card";
import { AvatarColorPicker } from "./avatar-color-picker";
import { AvatarPhotoUploader } from "./avatar-photo-uploader";
import { PasswordChangeForm } from "./password-change-form";

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default async function ProfilePage() {
  const employee = await getCurrentEmployee();
  if (!employee) return null;

  const manager = employee.managerId ? findEmployeeById(employee.managerId) : null;

  return (
    <div>
      <PageHeader title="Profil Saya" description="Informasi akun & preferensi pribadi." />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="space-y-5">
          <Card>
            <div className="flex items-center gap-4 mb-5">
              <AvatarPhotoUploader
                name={employee.name}
                avatarColor={employee.avatarColor}
                initialPhoto={employee.avatarPhoto}
              />
              <div>
                <p className="text-base font-semibold">{employee.name}</p>
                <p className="text-sm text-muted-foreground">{employee.jobTitle}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm border-t border-border pt-4">
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">NIP</p>
                <p className="font-mono">{employee.nip}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Email</p>
                <p>{employee.email}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Role</p>
                <p>{ROLE_LABEL[employee.role]}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Departemen</p>
                <p>{DEPARTMENT_LABEL[employee.department]}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Atasan Langsung</p>
                <p>{manager ? manager.name : "—"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Tanggal Bergabung</p>
                <p>{formatDate(employee.joinedAt)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Sisa Cuti Tahunan</p>
                <p className="font-mono">{employee.leaveBalance} hari</p>
              </div>
            </div>
          </Card>

          <Card>
            <h2 className="text-sm font-medium mb-1">Warna Avatar</h2>
            <p className="text-xs text-muted-foreground mb-3">
              Dipakai sebagai latar inisial kalau kamu tidak upload foto profil.
            </p>
            <AvatarColorPicker currentColor={employee.avatarColor} />
          </Card>
        </div>

        <Card>
          <h2 className="text-sm font-medium mb-4">Ganti Password</h2>
          <PasswordChangeForm />
        </Card>
      </div>
    </div>
  );
}
