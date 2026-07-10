import { ShieldCheck } from "lucide-react";
import { LogoutButton } from "./logout-button";

export function AdminTopbar({ name }: { name: string }) {
  return (
    <header className="h-16 border-b border-border bg-surface flex items-center justify-between px-4 sm:px-6 lg:px-8 gap-3">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <ShieldCheck className="h-4 w-4" strokeWidth={1.75} />
        Admin Sistem
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <span className="text-sm font-medium">{name}</span>
        <LogoutButton />
      </div>
    </header>
  );
}
