import type { Metadata } from "next";
import { getCurrentEmployee } from "@/lib/current-employee";
import { getAllAnnouncements } from "@/lib/announcements";

export const metadata: Metadata = { title: "Pengumuman" };
import { findEmployeeById } from "@/lib/db";
import { ROLE_LEVEL } from "@/lib/types";
import { Card, PageHeader } from "@/components/card";
import { AnnouncementForm } from "./announcement-form";

export default async function PengumumanPage() {
  const employee = await getCurrentEmployee();
  if (!employee) return null;

  const isManagement = ROLE_LEVEL[employee.role] <= ROLE_LEVEL.manager;
  const announcements = getAllAnnouncements();

  return (
    <div>
      <PageHeader title="Pengumuman" description="Informasi & pengumuman perusahaan" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {isManagement && (
          <Card className="lg:col-span-1 h-fit">
            <h2 className="text-sm font-medium mb-4">Buat Pengumuman</h2>
            <AnnouncementForm />
          </Card>
        )}

        <Card className={isManagement ? "lg:col-span-2" : "lg:col-span-3"}>
          <h2 className="text-sm font-medium mb-4">
            Semua Pengumuman ({announcements.length})
          </h2>
          {announcements.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">
              Belum ada pengumuman.
            </p>
          ) : (
            <div className="space-y-3">
              {announcements.map((a) => {
                const author = findEmployeeById(a.createdBy);
                return (
                  <div
                    key={a.id}
                    className={`rounded-[10px] border p-4 ${a.priority === "penting" ? "border-danger/30 bg-danger/5" : "border-border"}`}
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <p className="text-sm font-medium">
                          {a.priority === "penting" && (
                            <span className="inline-flex items-center rounded-full bg-danger/10 text-danger border border-danger/25 px-2 py-0.5 text-xs font-medium mr-2">
                              Penting
                            </span>
                          )}
                          {a.title}
                        </p>
                      </div>
                      <span className="text-xs text-muted-foreground shrink-0">
                        {new Date(a.createdAt).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                    <p className="text-sm text-foreground/80 whitespace-pre-wrap">{a.content}</p>
                    {author && (
                      <p className="text-xs text-muted-foreground mt-3">Oleh: {author.name}</p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
