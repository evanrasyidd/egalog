import Link from "next/link";
import { Briefcase, MapPin, Users, TrendingUp, ArrowRight } from "lucide-react";
import { getOpenJobPostings } from "@/lib/recruitment";
import { DEPARTMENT_LABEL } from "@/lib/types";

// ISR: halaman ini publik & datanya jarang berubah (lowongan baru cuma
// dibuat sesekali oleh HR) — cache 60 detik supaya visitor berulang/crawler
// tidak memicu Function Invocation baru tiap request. Penting khusus untuk
// halaman PUBLIK seperti ini karena traffic-nya tidak terautentikasi
// (bisa di-hit siapa saja/bot), beda dengan halaman internal yang memang
// harus selalu live per-user.
export const revalidate = 60;

const EMPLOYMENT_TYPE_LABEL: Record<string, string> = {
  full_time: "Full-time",
  kontrak: "Kontrak",
  magang: "Magang",
};

export default async function KarirPage() {
  const postings = getOpenJobPostings();

  return (
    <div>
      <section className="bg-primary text-primary-foreground px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="max-w-3xl mx-auto text-center space-y-5">
          <p className="text-sm uppercase tracking-wider text-primary-foreground/60 font-medium">
            Karir di PT EgaLog Indonesia
          </p>
          <h1 className="text-3xl sm:text-4xl font-semibold leading-tight tracking-tight">
            Bangun karir di jantung logistik Indonesia
          </h1>
          <p className="text-primary-foreground/75 text-base leading-relaxed max-w-xl mx-auto">
            EgaLog mengelola distribusi & pergudangan untuk klien di seluruh
            Jabodetabek. Kami cari orang-orang yang teliti, gesit, dan senang
            kerja tim untuk bertumbuh bersama kami.
          </p>
        </div>
      </section>

      <section className="px-4 sm:px-6 lg:px-8 py-12 border-b border-border">
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-[10px] bg-surface-muted flex items-center justify-center shrink-0">
              <Users className="h-5 w-5 text-primary" strokeWidth={1.75} />
            </div>
            <div>
              <p className="font-medium text-sm">19+ Karyawan</p>
              <p className="text-sm text-muted-foreground">
                Tim yang terus bertumbuh di 6 departemen.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-[10px] bg-surface-muted flex items-center justify-center shrink-0">
              <MapPin className="h-5 w-5 text-primary" strokeWidth={1.75} />
            </div>
            <div>
              <p className="font-medium text-sm">Depok, Jawa Barat</p>
              <p className="text-sm text-muted-foreground">
                Kantor pusat & gudang operasional utama.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-[10px] bg-surface-muted flex items-center justify-center shrink-0">
              <TrendingUp className="h-5 w-5 text-primary" strokeWidth={1.75} />
            </div>
            <div>
              <p className="font-medium text-sm">Jenjang Karir Jelas</p>
              <p className="text-sm text-muted-foreground">
                Dari Staff sampai Manager, jalurnya terbuka.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-xl font-semibold tracking-tight mb-1">Lowongan Terbuka</h2>
          <p className="text-sm text-muted-foreground mb-8">
            {postings.length > 0
              ? `${postings.length} posisi sedang membuka lamaran.`
              : "Belum ada posisi yang dibuka saat ini — cek lagi nanti."}
          </p>

          {postings.length === 0 ? (
            <div className="rounded-[10px] border border-border bg-surface p-10 text-center">
              <Briefcase className="h-8 w-8 mx-auto text-muted-foreground mb-3" strokeWidth={1.5} />
              <p className="text-sm text-muted-foreground">
                Belum ada lowongan dibuka. Pantau terus halaman ini untuk update.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {postings.map((job) => (
                <Link key={job.id} href={`/karir/lowongan/${job.id}`} className="block group">
                  <div className="rounded-[10px] border border-border bg-surface p-5 hover:border-primary/40 transition-colors flex items-center justify-between gap-4">
                    <div>
                      <p className="font-medium">{job.title}</p>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        {DEPARTMENT_LABEL[job.department]} ·{" "}
                        {EMPLOYMENT_TYPE_LABEL[job.employmentType]}
                      </p>
                    </div>
                    <ArrowRight
                      className="h-4 w-4 text-muted-foreground shrink-0 group-hover:translate-x-0.5 transition-transform"
                      strokeWidth={1.75}
                    />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
