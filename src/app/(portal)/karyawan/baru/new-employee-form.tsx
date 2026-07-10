"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, UserPlus, TriangleAlert, CheckCircle2, Copy, Check } from "lucide-react";
import { DEPARTMENT_LABEL, ROLE_LABEL } from "@/lib/types";
import type { Department, Role } from "@/lib/types";

const ROLE_OPTIONS = Object.entries(ROLE_LABEL) as [Role, string][];
const DEPARTMENT_OPTIONS = Object.entries(DEPARTMENT_LABEL) as [Department, string][];

interface ManagerOption {
  id: string;
  name: string;
  jobTitle: string;
}

export function NewEmployeeForm({ managerOptions }: { managerOptions: ManagerOption[] }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [role, setRole] = useState<Role>("staff");
  const [department, setDepartment] = useState<Department>("operasional");
  const [jobTitle, setJobTitle] = useState("");
  const [managerId, setManagerId] = useState(managerOptions[0]?.id ?? "");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [created, setCreated] = useState<{ email: string; tempPassword: string } | null>(null);
  const [copied, setCopied] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/karyawan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          role,
          department,
          jobTitle,
          managerId: role === "owner" ? null : managerId,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message ?? "Gagal menambah karyawan.");
        return;
      }
      setCreated({ email: data.employee.email, tempPassword: data.tempPassword });
    } catch {
      setError("Terjadi kesalahan jaringan.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleCopy() {
    if (!created) return;
    await navigator.clipboard.writeText(
      `Email: ${created.email}\nPassword sementara: ${created.tempPassword}`,
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (created) {
    return (
      <div className="space-y-4">
        <div className="flex items-start gap-2 rounded-[10px] bg-success/10 border border-success/25 px-4 py-3 text-sm text-success">
          <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" strokeWidth={1.75} />
          <span>Karyawan berhasil ditambahkan. Sampaikan kredensial ini ke karyawan yang bersangkutan.</span>
        </div>

        <div className="rounded-[10px] border border-border bg-surface-muted p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Email</span>
            <span className="font-mono">{created.email}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Password Sementara</span>
            <span className="font-mono font-semibold">{created.tempPassword}</span>
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          Password ini cuma ditampilkan sekali di sini dan tidak disimpan dalam bentuk asli —
          catat/salin sekarang sebelum meninggalkan halaman ini.
        </p>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-2 rounded-[10px] border border-border bg-surface px-4 py-2.5 text-sm font-medium hover:bg-surface-muted transition-colors"
          >
            {copied ? (
              <Check className="h-4 w-4 text-success" strokeWidth={1.75} />
            ) : (
              <Copy className="h-4 w-4" strokeWidth={1.75} />
            )}
            {copied ? "Tersalin" : "Salin"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/karyawan")}
            className="flex items-center gap-2 rounded-[10px] bg-primary text-primary-foreground px-4 py-2.5 text-sm font-medium hover:bg-primary-soft transition-colors"
          >
            Selesai
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <label htmlFor="name" className="text-sm font-medium">
          Nama Lengkap
        </label>
        <input
          id="name"
          type="text"
          required
          minLength={3}
          maxLength={150}
          value={name}
          onChange={(e) => setName(e.target.value)}
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
          placeholder="Mis. Staff Gudang"
          className="w-full rounded-[10px] border border-border bg-surface px-3.5 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
        />
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

      <button
        type="submit"
        disabled={isSubmitting}
        className="flex items-center gap-2 rounded-[10px] bg-primary text-primary-foreground px-4 py-2.5 text-sm font-medium hover:bg-primary-soft transition-colors disabled:opacity-60"
      >
        {isSubmitting ? (
          <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} />
        ) : (
          <UserPlus className="h-4 w-4" strokeWidth={1.75} />
        )}
        Tambah Karyawan
      </button>
    </form>
  );
}
