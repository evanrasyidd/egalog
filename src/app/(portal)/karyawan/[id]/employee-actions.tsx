"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, UserX, UserCheck, KeyRound, TriangleAlert, Copy, Check } from "lucide-react";

export function EmployeeStatusAction({
  employeeId,
  isActive,
}: {
  employeeId: string;
  isActive: boolean;
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  async function handleToggle() {
    setError(null);
    setIsLoading(true);
    try {
      const res = await fetch(`/api/karyawan/${employeeId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !isActive }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message ?? "Gagal mengubah status.");
        return;
      }
      setShowConfirm(false);
      router.refresh();
    } catch {
      setError("Terjadi kesalahan jaringan.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      {error && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-[10px] bg-danger/10 border border-danger/30 px-3.5 py-2.5 text-sm text-danger"
        >
          <TriangleAlert className="h-4 w-4 mt-0.5 shrink-0" strokeWidth={1.75} />
          <span>{error}</span>
        </div>
      )}

      {showConfirm ? (
        <div className="space-y-2">
          <p className="text-sm text-foreground/80">
            Yakin nonaktifkan karyawan ini? Mereka tidak akan bisa login lagi.
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleToggle}
              disabled={isLoading}
              className="flex items-center gap-2 rounded-[10px] bg-danger text-danger-foreground px-3.5 py-2 text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-60"
            >
              {isLoading && <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} />}
              Ya, Nonaktifkan
            </button>
            <button
              type="button"
              onClick={() => setShowConfirm(false)}
              className="rounded-[10px] border border-border bg-surface px-3.5 py-2 text-sm font-medium hover:bg-surface-muted transition-colors"
            >
              Batal
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => (isActive ? setShowConfirm(true) : handleToggle())}
          disabled={isLoading}
          className={`flex items-center gap-2 rounded-[10px] px-3.5 py-2 text-sm font-medium transition-colors disabled:opacity-60 ${
            isActive
              ? "border border-border bg-surface hover:bg-surface-muted"
              : "bg-primary text-primary-foreground hover:bg-primary-soft"
          }`}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} />
          ) : isActive ? (
            <UserX className="h-4 w-4" strokeWidth={1.75} />
          ) : (
            <UserCheck className="h-4 w-4" strokeWidth={1.75} />
          )}
          {isActive ? "Nonaktifkan Karyawan" : "Aktifkan Kembali"}
        </button>
      )}
    </div>
  );
}

export function ResetPasswordAction({ employeeId }: { employeeId: string }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tempPassword, setTempPassword] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function handleReset() {
    setError(null);
    setIsLoading(true);
    try {
      const res = await fetch(`/api/karyawan/${employeeId}/reset-password`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message ?? "Gagal reset password.");
        return;
      }
      setTempPassword(data.tempPassword);
    } catch {
      setError("Terjadi kesalahan jaringan.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCopy() {
    if (!tempPassword) return;
    await navigator.clipboard.writeText(tempPassword);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (tempPassword) {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between rounded-[10px] border border-border bg-surface-muted px-3.5 py-2.5">
          <span className="font-mono font-semibold text-sm">{tempPassword}</span>
          <button
            type="button"
            onClick={handleCopy}
            aria-label="Salin password"
            className="h-7 w-7 flex items-center justify-center rounded-[6px] hover:bg-surface transition-colors"
          >
            {copied ? (
              <Check className="h-3.5 w-3.5 text-success" strokeWidth={1.75} />
            ) : (
              <Copy className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={1.75} />
            )}
          </button>
        </div>
        <p className="text-xs text-muted-foreground">
          Password ini cuma tampil sekali — sampaikan ke karyawan sekarang.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {error && <p className="text-xs text-danger">{error}</p>}
      <button
        type="button"
        onClick={handleReset}
        disabled={isLoading}
        className="flex items-center gap-2 rounded-[10px] border border-border bg-surface px-3.5 py-2 text-sm font-medium hover:bg-surface-muted transition-colors disabled:opacity-60"
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} />
        ) : (
          <KeyRound className="h-4 w-4" strokeWidth={1.75} />
        )}
        Reset Password
      </button>
    </div>
  );
}
