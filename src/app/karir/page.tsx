import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { getOpenJobPostings } from "@/lib/recruitment";
import { DEPARTMENT_LABEL } from "@/lib/types";
import { StampBadge } from "@/components/stamp-badge";

// ISR: halaman ini publik & datanya jarang berubah (lowongan baru cuma
// dibuat sesekali oleh HR) — cache 60 detik supaya visitor berulang/crawler
// tidak memicu Function Invocation baru tiap request.
export const revalidate = 60;

const EMPLOYMENT_TYPE_LABEL: Record<string, string> = {
  full_time: "Full-time",
  kontrak: "Kontrak",
  magang: "Magang",
};

function todayManifestCode(): string {
  const now = new Date();
  return `EGALOG/KARIR/${now.getFullYear()}`;
}

export default async function KarirPage() {
  const postings = getOpenJobPostings();

  return (
    <div>
      {/* HERO — dibingkai kayak header dokumen manifest, bukan hero SaaS
          simetris-di-tengah. Kode referensi + stempel jadi identitas. */}
      <section className="bg-primary text-primary-foreground px-4 sm:px-6 lg:px-8 pt-14 pb-16 sm:pt-20 sm:pb-24">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-dashed border-primary-foreground/25">
            <span className="text-xs font-mono tracking-widest text-primary-foreground/50 uppercase">
              {todayManifestCode()}
            </span>
            <StampBadge label="Sedang Merekrut" />
          </div>

          <h1 className="text-3xl sm:text-5xl font-semibold leading-[1.1] tracking-tight max-w-2xl">
            Setiap paket punya rute.
            <br />
            Setiap orang punya jalur karir.
          </h1>
          <p className="mt-5 text-primary-foreground/70 text-base leading-relaxed max-w-lg">
            EgaLog menjalankan distribusi & pergudangan untuk klien di seluruh
            Jabodetabek. Dari lantai gudang sampai ruang meeting — semua rute
            di sini dimulai dari satu titik keberangkatan yang sama.
          </p>
        </div>
      </section>

      {/* MANIFEST LEDGER — pengganti 3 kartu ikon generic. Satu baris
          ringkasan gaya dokumen resmi, dipisah hairline, angka monospace. */}
      <section className="border-b border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-3 divide-x divide-border">
            {[
              { value: "6", label: "Departemen" },
              { value: "19+", label: "Karyawan Aktif" },
              { value: "Depok", label: "Kantor Pusat" },
            ].map((item) => (
              <div key={item.label} className="py-6 px-2 sm:px-4">
                <p className="text-2xl sm:text-3xl font-mono font-semibold tracking-tight">
                  {item.value}
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* LOWONGAN — tiap baris diformat kayak entri manifest: kode referensi,
          rute departemen -> posisi, bukan card generic dengan ikon panah. */}
      <section className="px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xl font-semibold tracking-tight mb-1">Lowongan Terbuka</h2>
          <p className="text-sm text-muted-foreground mb-8">
            {postings.length > 0
              ? `${postings.length} posisi tercatat dalam manifest perekrutan bulan ini.`
              : "Belum ada posisi tercatat saat ini — pantau lagi nanti."}
          </p>

          {postings.length === 0 ? (
            <div className="rounded-[10px] border border-dashed border-border p-10 text-center">
              <p className="text-sm text-muted-foreground">
                Manifest perekrutan sedang kosong. Cek lagi dalam beberapa minggu.
              </p>
            </div>
          ) : (
            <div className="border-t border-border">
              {postings.map((job, index) => (
                <Link
                  key={job.id}
                  href={`/karir/lowongan/${job.id}`}
                  className="group flex items-center gap-4 py-5 border-b border-border hover:bg-surface-muted transition-colors -mx-4 px-4 sm:-mx-6 sm:px-6"
                >
                  <span className="text-xs font-mono text-muted-foreground shrink-0 w-16 sm:w-20">
                    REF-{String(index + 1).padStart(3, "0")}
                  </span>

                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{job.title}</p>
                    <p className="text-sm text-muted-foreground mt-0.5 flex items-center gap-1.5 flex-wrap">
                      <span>{DEPARTMENT_LABEL[job.department]}</span>
                      <span className="text-border" aria-hidden="true">
                        ·⋯·
                      </span>
                      <span>{EMPLOYMENT_TYPE_LABEL[job.employmentType]}</span>
                    </p>
                  </div>

                  <ArrowUpRight
                    className="h-4 w-4 text-muted-foreground shrink-0 group-hover:text-accent group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all"
                    strokeWidth={1.75}
                  />
                </Link>
              ))}
            </div>
          )}

          {postings.length > 0 && (
            <p className="mt-6 text-xs text-muted-foreground flex items-center gap-1.5">
              Klik posisi untuk lihat detail & kirim lamaran
              <ArrowRight className="h-3 w-3" strokeWidth={1.75} />
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
