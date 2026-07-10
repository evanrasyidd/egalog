"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { LogOut } from "lucide-react";

export function LogoutButton() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function handleLogout() {
    setIsLoading(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={isLoading}
      aria-label="Keluar dari akun"
      className="h-9 w-9 flex items-center justify-center rounded-[8px] text-muted-foreground hover:bg-surface-muted hover:text-foreground transition-colors disabled:opacity-50"
    >
      <LogOut className="h-4 w-4" strokeWidth={1.75} />
    </button>
  );
}
