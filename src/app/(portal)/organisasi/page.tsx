import { employees, getDirectReports } from "@/lib/db";
import { ROLE_LABEL, DEPARTMENT_LABEL } from "@/lib/types";
import type { Employee } from "@/lib/types";
import { Card, PageHeader } from "@/components/card";
import { Avatar } from "@/components/avatar";

function OrgNode({ person, depth }: { person: Employee; depth: number }) {
  const reports = getDirectReports(person.id);
  return (
    <div className={depth > 0 ? "ml-3 sm:ml-6 border-l border-border pl-3 sm:pl-5" : ""}>
      <div className="flex items-center gap-2 sm:gap-3 py-2.5">
        <Avatar name={person.name} avatarColor={person.avatarColor} avatarPhoto={person.avatarPhoto} size="sm" />
        <div className="min-w-0">
          <p className="text-sm font-medium leading-tight truncate">{person.name}</p>
          <p className="text-xs text-muted-foreground leading-tight truncate">
            {person.jobTitle} · {DEPARTMENT_LABEL[person.department]}
          </p>
        </div>
        <span className="ml-auto text-xs text-muted-foreground shrink-0">
          {ROLE_LABEL[person.role]}
        </span>
      </div>
      {reports.length > 0 && (
        <div>
          {reports
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((r) => (
              <OrgNode key={r.id} person={r} depth={depth + 1} />
            ))}
        </div>
      )}
    </div>
  );
}

export default function OrganisasiPage() {
  const owner = employees.find((e) => e.role === "owner");
  if (!owner) return null;

  return (
    <div>
      <PageHeader
        title="Struktur Organisasi"
        description="Garis komando PT EgaLog Indonesia — Owner sampai Staff."
      />
      <Card>
        <OrgNode person={owner} depth={0} />
      </Card>
    </div>
  );
}
