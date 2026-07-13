import { notFound } from "next/navigation";
import { BackLink } from "@/components/back-link";
import { StampBadge } from "@/components/stamp-badge";
import { findJobPostingById, getOpenJobPostings } from "@/lib/recruitment";
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

  // Kode referensi konsisten dengan urutan yang ditampilkan di /karir.
  const openPostings = getOpenJobPostings();
  const refIndex = openPostings.findIndex((p) => p.id === posting.id);
  const refCode = `REF-${String(refIndex + 1).padStart(3, "0")}`;

  return (
    <div>
      <section className="bg-primary text-primary-foreground px-4 sm:px-6 lg:px-8 pt-10 pb-14 sm:pt-14 sm:pb-20">
        <div className="max-w-3xl mx-auto">
          <BackLink
            href="/karir"
            label="Kembali ke Manifest Lowongan"
            className="text-primary-foreground/60 hover:text-primary-foreground mb-6"
          />

          <div className="flex items-center justify-between mb-6 pb-4 border-b border-dashed border-primary-foreground/25">
            <span className="text-xs font-mono tracking-widest text-primary-foreground/50 uppercase">
              {refCode}
            </span>
            <StampBadge label="Dibuka" />
          </div>

          <p className="text-sm text-primary-foreground/60 mb-2">
            {DEPARTMENT_LABEL[posting.department]} · {EMPLOYMENT_TYPE_LABEL[posting.employmentType]}
          </p>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">{posting.title}</h1>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-12">
          <div>
            <h2 className="text-xs font-mono tracking-widest text-muted-foreground uppercase mb-3">
              Deskripsi Pekerjaan
            </h2>
            <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-line">
              {posting.description}
            </p>
          </div>
          <div>
            <h2 className="text-xs font-mono tracking-widest text-muted-foreground uppercase mb-3">
              Kualifikasi
            </h2>
            <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-line">
              {posting.requirements}
            </p>
          </div>
        </div>

        <div className="rounded-[10px] border border-border bg-surface p-6 sm:p-8">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-dashed border-border">
            <h2 className="text-base font-semibold">Kirim Lamaran</h2>
            <span className="text-xs font-mono text-muted-foreground">{refCode}</span>
          </div>
          <PublicApplyForm jobPostingId={posting.id} />
        </div>
      </section>
    </div>
  );
}
