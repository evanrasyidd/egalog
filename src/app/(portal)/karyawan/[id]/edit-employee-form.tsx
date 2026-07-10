"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save, TriangleAlert, CheckCircle2 } from "lucide-react";
import { DEPARTMENT_LABEL, ROLE_LABEL } from "@/lib/types";
import type { Department, Role } from "@/lib/types";

const ROLE_OPTIONS = Object.entries(ROLE_LABEL) as [Role, string][];
const DEPARTMENT_OPTIONS = Object.entries(DEPARTMENT_LABEL) as [Department, string][];

interface ManagerOption {
  id: string;
  name: string;
  jobTitle: string;
}

export function EditEmployeeForm({
  employeeId,
  initialJobTitle,
  initialDepartment,
  initialRole,
  initialManagerId,
  managerOptions,
}: {
  employeeId: string;
  initialJobTitle: string;
  initialDepartment: Department;
  initialRole: Role;
  initialManagerId: string | null;
  managerOptions: ManagerOption[];
}) {
  const router = useRouter();
  const [jobTitle, setJobTitle] = useState(initialJobTitle);
  const [department, setDepartment] = useState<Department>(initialDepartment);
  const [role, setRole] = useState<Role>(initialRole);
  const [managerId, setManagerId] = useState(initialManagerId ?? managerOptions[0]?.id ?? "");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/karyawan/${employeeId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobTitle,
          department,
          role,
          managerId: role === "owner" ? null : managerId,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message ?? "Gagal menyimpan perubahan.");
        return;
      }
      setSuccess(true);
      router.refresh();
    } catch {
      setError("Terjadi kesalahan jaringan.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <label htmlFor="jobTitle" className="text-sm font-medium">
          Jabatan
        </label>
        <input
          id="jobTitle"
          type="text"
          required
          minLength={2}
          maxLength={150}
          value={jobTitle}
          onChange={(e) => setJobTitle(e.target.value)}
          className="w-full rounded-[10px] border border-border bg-surface px-3.5 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label htmlFor="role" className="text-sm font-medium">
            Role
          </label>
          <select
            id="role"
            value={role}
            onChange={(e) => setRole(e.target.value as Role)}
            className="w-full rounded-[10px] border border-border bg-surface px-3.5 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          >
            {ROLE_OPTIONS.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <label htmlFor="department" className="text-sm font-medium">
            Departemen
          </label>
          <select
            id="department"
            value={department}
            onChange={(e) => setDepartment(e.target.value as Department)}
            className="w-full rounded-[10px] border border-border bg-surface px-3.5 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          >
            {DEPARTMENT_OPTIONS.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {role !== "owner" && (
        <div className="space-y-1.5">
          <label htmlFor="managerId" className="text-sm font-medium">
            Atasan Langsung
          </label>
          <select
            id="managerId"
            value={managerId}
            onChange={(e) => setManagerId(e.target.value)}
            className="w-full rounded-[10px] border border-border bg-surface px-3.5 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          >
            {managerOptions.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} — {m.jobTitle}
              </option>
            ))}
          </select>
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-[10px] bg-danger/10 border border-danger/30 px-3.5 py-2.5 text-sm text-danger"
        >
          <TriangleAlert className="h-4 w-4 mt-0.5 shrink-0" strokeWidth={1.75} />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="flex items-start gap-2 rounded-[10px] bg-success/10 border border-success/25 px-3.5 py-2.5 text-sm text-success">
          <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" strokeWidth={1.75} />
          <span>Perubahan tersimpan.</span>
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="flex items-center gap-2 rounded-[10px] bg-primary text-primary-foreground px-4 py-2.5 text-sm font-medium hover:bg-primary-soft transition-colors disabled:opacity-60"
      >
        {isSubmitting ? (
          <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} />
        ) : (
          <Save className="h-4 w-4" strokeWidth={1.75} />
        )}
        Simpan Perubahan
      </button>
    </form>
  );
}
