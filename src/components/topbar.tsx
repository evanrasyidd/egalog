import Link from "next/link";
import { LogoutButton } from "./logout-button";
import { Avatar } from "./avatar";
import { ROLE_LABEL, DEPARTMENT_LABEL } from "@/lib/types";
import type { Employee } from "@/lib/types";

export function Topbar({ employee }: { employee: Employee }) {
  return (
    <header className="h-16 border-b border-border bg-surface flex items-center justify-between px-4 sm:px-6 lg:px-8 gap-3">
      <div className="text-sm text-muted-foreground truncate">
        {DEPARTMENT_LABEL[employee.department]}
      </div>

      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <Link
          href="/profile"
          className="flex items-center gap-3 rounded-[8px] px-2 py-1 -mx-2 hover:bg-surface-muted transition-colors"
        >
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium leading-tight">{employee.name}</p>
            <p className="text-xs text-muted-foreground leading-tight">
              {ROLE_LABEL[employee.role]} · {employee.jobTitle}
            </p>
          </div>
          <Avatar name={employee.name} avatarColor={employee.avatarColor} avatarPhoto={employee.avatarPhoto} />
        </Link>
        <LogoutButton />
      </div>
    </header>
  );
}
