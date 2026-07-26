"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { LogOut } from "lucide-react";
import { ConfirmDialog } from "@/components/confirm-dialog";

export function LogoutButton() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  async function handleLogout() {
    setIsLoading(true);
    setShowConfirm(false);
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setShowConfirm(true)}
        disabled={isLoading}
        aria-label="Keluar dari akun"
        className="h-9 w-9 flex items-center justify-center rounded-[8px] text-muted-foreground hover:bg-surface-muted hover:text-foreground transition-colors disabled:opacity-50"
      >
        <LogOut className="h-4 w-4" strokeWidth={1.75} />
      </button>
      <ConfirmDialog
        open={showConfirm}
        title="Keluar dari akun?"
        message="Kamu akan logout dari sistem. Perlu login lagi untuk mengakses."
        confirmLabel="Ya, logout"
        variant="warning"
        onConfirm={handleLogout}
        onCancel={() => setShowConfirm(false)}
      />
    </>
  );
}
