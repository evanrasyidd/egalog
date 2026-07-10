import { notFound } from "next/navigation";
import { BackLink } from "@/components/back-link";
import { findJobPostingById } from "@/lib/recruitment";
import { DEPARTMENT_LABEL } from "@/lib/types";
import { PublicApplyForm } from "./public-apply-form";

export const revalidate = 60;

const EMPLOYMENT_TYPE_LABEL: Record<string, string> = {
  full_time: "Full-time",
  kontrak: "Kontrak",
  magang: "Magang",
};

export default async function KarirLowonganDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const posting = findJobPostingById(id);

  // Lowongan yang sudah ditutup tidak boleh terlihat/dilamar dari halaman
  // publik — cukup 404, bukan ditampilkan dengan status "ditutup" (yang
  // berarti membocorkan histori lowongan lama ke publik tanpa perlu).
  if (!posting || posting.status !== "dibuka") notFound();

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      <BackLink href="/karir" label="Kembali ke Lowongan" />

      <div className="mb-8">
        <p className="text-sm text-muted-foreground mb-1">
          {DEPARTMENT_LABEL[posting.department]} · {EMPLOYMENT_TYPE_LABEL[posting.employmentType]}
        </p>
        <h1 className="text-2xl font-semibold tracking-tight">{posting.title}</h1>
      </div>

      <div className="space-y-6 mb-10">
        <div>
          <h2 className="text-sm font-medium mb-2">Deskripsi Pekerjaan</h2>
          <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-line">
            {posting.description}
          </p>
        </div>
        <div>
          <h2 className="text-sm font-medium mb-2">Kualifikasi</h2>
          <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-line">
            {posting.requirements}
          </p>
        </div>
      </div>

      <div className="rounded-[10px] border border-border bg-surface p-6">
        <h2 className="text-base font-semibold mb-4">Lamar Posisi Ini</h2>
        <PublicApplyForm jobPostingId={posting.id} />
      </div>
    </div>
  );
}
