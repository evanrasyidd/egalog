import Link from "next/link";
import type { Metadata } from "next";
import { ArrowDown, ArrowRight, CheckCircle2 } from "lucide-react";
import { getOpenJobPostings } from "@/lib/recruitment";
import { employees } from "@/lib/db";
import { DEPARTMENT_LABEL } from "@/lib/types";
import { EMPLOYMENT_TYPE_LABEL, WORK_ARRANGEMENT_LABEL } from "@/lib/labels";
import { formatDateID } from "@/lib/date";
import { serializeJsonLd } from "@/lib/json-ld";
import { BrandMark } from "@/components/brand";

export const metadata: Metadata = {
  // absolute: jangan biarkan template root menambahkan "· EgaLog HR" lagi.
  title: {
    absolute: "Karier di EgaLog — Lowongan Logistik & Pergudangan",
  },
};

// ISR: halaman ini publik & datanya jarang berubah (lowongan baru cuma
// dibuat sesekali oleh HR) — cache 60 detik supaya visitor berulang/crawler
// tidak memicu Function Invocation baru tiap request.
export const revalidate = 60;

const BENEFITS = [
  "BPJS Kesehatan dan Ketenagakerjaan",
  "Cuti tahunan dan cuti bersama",
  "Tunjangan transport dan makan harian",
  "Pelatihan internal dan rotasi lintas divisi",
  "Peralatan kerja dan seragam operasional",
];

const HIRING_STEPS = [
  {
    title: "Kirim lamaran",
    body: "Isi form di halaman lowongan dan unggah CV. Tidak perlu akun.",
  },
  {
    title: "Screening oleh tim HR",
    body: "HR mencocokkan pengalamanmu dengan kebutuhan posisi.",
  },
  {
    title: "Wawancara",
    body: "Ngobrol dengan HR dan calon atasan langsung, bisa online atau di kantor.",
  },
  {
    title: "Penawaran",
    body: "Kandidat yang terpilih menerima penawaran dan jadwal mulai kerja.",
  },
];

function listJobTitles(titles: string[]): string {
  if (titles.length === 0) return "";
  if (titles.length === 1) return titles[0];
  return `${titles.slice(0, -1).join(", ")}, dan ${titles[titles.length - 1]}`;
}

export default async function KarirPage() {
  const postings = getOpenJobPostings();
  const activeEmployees = employees.filter((e) => e.isActive);
  const departmentCount = new Set(activeEmployees.map((e) => e.department)).size;

  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden bg-background py-14 sm:py-20 lg:pb-32 lg:pt-28">
        <BrandMark
          tone="mono"
          className="pointer-events-none absolute -right-24 top-4 hidden h-[420px] w-[420px] text-primary opacity-[0.07] sm:block lg:-right-10 lg:top-6 lg:h-[560px] lg:w-[560px]"
        />
        <div className="relative mx-auto max-w-[1200px] px-6">
          <p className="mb-5 text-base font-semibold text-accent">
            Karier di EgaLog
          </p>
          <h1 className="max-w-[820px] font-display text-[40px] font-extrabold leading-[1.02] tracking-[-0.03em] text-primary sm:text-[56px] lg:text-[88px]">
            Gabung ke tim EgaLog di Depok.
          </h1>
          <p className="mt-7 max-w-[620px] text-lg leading-[1.6] text-muted-foreground sm:text-xl">
            EgaLog menangani distribusi dan pergudangan untuk klien korporat di
            Jabodetabek.{" "}
            {postings.length > 0
              ? `Sekarang kami membuka ${postings.length} posisi: ${listJobTitles(
                  postings.map((job) => job.title),
                )}. Melamarnya lewat form saja, tidak perlu bikin akun.`
              : "Belum ada posisi yang dibuka saat ini. Kamu tetap bisa mengirim CV untuk pembukaan berikutnya."}
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <a
              href="#lowongan"
              className="inline-flex min-h-[54px] items-center gap-2.5 rounded-[6px] bg-accent px-6 text-[17px] font-bold text-accent-foreground transition-colors hover:bg-accent/90"
            >
              Lihat lowongan
              <ArrowDown className="h-5 w-5" strokeWidth={2} aria-hidden="true" />
            </a>
            <a
              href="#seleksi"
              className="inline-flex min-h-[54px] items-center rounded-[6px] border-[1.5px] border-primary px-6 text-[17px] font-semibold text-primary transition-colors hover:bg-primary/5"
            >
              Alur seleksi
            </a>
          </div>
        </div>
      </section>

      {/* LOWONGAN */}
      <section
        id="lowongan"
        className="scroll-mt-6 bg-primary py-14 text-primary-foreground sm:py-20 lg:py-24"
      >
        <div className="mx-auto max-w-[1200px] px-6">
          <h2 className="font-display text-[30px] font-extrabold leading-[1.08] tracking-[-0.02em] text-primary-foreground sm:text-[40px] lg:text-[48px]">
            {postings.length > 0
              ? `${postings.length} posisi yang sedang dibuka`
              : "Belum ada posisi yang dibuka"}
          </h2>
          <p className="mt-3.5 text-lg leading-normal text-primary-foreground/75">
            {postings.length > 0
              ? "Pilih posisi untuk membaca detailnya dan mengisi form lamaran."
              : "Kirim CV ke karir@egalog.co.id — kami simpan untuk pembukaan berikutnya."}
          </p>

          {postings.length > 0 ? (
            <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {postings.map((job) => (
                <Link
                  key={job.id}
                  href={`/karir/lowongan/${job.id}`}
                  className="group flex flex-col rounded-[8px] bg-surface p-7 text-primary transition-transform duration-200 hover:-translate-y-0.5"
                >
                  <p className="text-[15px] font-semibold text-accent">
                    {DEPARTMENT_LABEL[job.department]}
                  </p>
                  <h3 className="mt-1.5 font-display text-[26px] font-extrabold leading-[1.1] tracking-[-0.02em] sm:text-[30px]">
                    {job.title}
                  </h3>
                  <div className="mt-5 flex flex-col gap-1.5 text-[17px] leading-normal text-muted-foreground">
                    <p>
                      {EMPLOYMENT_TYPE_LABEL[job.employmentType]} ·{" "}
                      {WORK_ARRANGEMENT_LABEL[job.workArrangement]}
                    </p>
                    <p>{job.location}</p>
                    <p className="font-semibold text-foreground">
                      {job.salaryRange ?? "Gaji dirahasiakan"}
                    </p>
                  </div>
                  <div className="mt-auto pt-7">
                    <div className="flex items-center justify-between gap-3 border-t border-border pt-[18px]">
                      <span className="text-base font-semibold">
                        {job.deadline
                          ? `Tutup ${formatDateID(job.deadline, {
                              day: "numeric",
                              month: "short",
                            })}`
                          : "Tanpa batas"}
                      </span>
                      <span className="inline-flex items-center gap-2 text-base font-semibold text-accent">
                        Lihat detail
                        <ArrowRight
                          className="h-[18px] w-[18px] transition-transform group-hover:translate-x-0.5"
                          strokeWidth={2}
                          aria-hidden="true"
                        />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="mt-12 rounded-[8px] border border-dashed border-primary-foreground/25 p-10 text-center">
              <p className="text-lg text-primary-foreground/75">
                Belum ada lowongan aktif. Kirim profilmu ke{" "}
                <a
                  href="mailto:karir@egalog.co.id"
                  className="font-semibold text-accent-light underline"
                >
                  karir@egalog.co.id
                </a>
                .
              </p>
            </div>
          )}
        </div>
      </section>

      {/* TENTANG */}
      <section
        id="tentang"
        className="scroll-mt-6 bg-background py-14 sm:py-20 lg:py-[104px]"
      >
        <div className="mx-auto flex max-w-[1200px] flex-wrap items-start justify-between gap-x-20 gap-y-12 px-6">
          <div className="max-w-[640px] flex-1 basis-[480px]">
            <h2 className="font-display text-[30px] font-extrabold leading-[1.08] tracking-[-0.02em] text-primary sm:text-[40px] lg:text-[48px]">
              Tentang EgaLog
            </h2>
            <p className="mt-7 text-[19px] leading-[1.7] text-muted-foreground">
              EgaLog menangani distribusi barang dan pergudangan untuk klien
              korporat di Jabodetabek. Kantor pusat dan gudang pusat kami ada di
              Depok. Tim kami mengurus penerimaan barang, penyimpanan,
              pengiriman, sampai layanan pelanggan.
            </p>
            <p className="mt-4.5 text-[19px] leading-[1.7] text-muted-foreground">
              Sekarang ada {activeEmployees.length} karyawan di {departmentCount}{" "}
              departemen. Setiap posisi punya uraian tugas tertulis, dan banyak
              supervisor serta manager kami dulunya mulai dari staf. Review
              performa dijalankan dua kali setahun.
            </p>
          </div>

          <dl className="min-w-[min(100%,280px)] flex-[0_1_420px] rounded-[8px] bg-surface">
            {[
              { label: "Bidang usaha", value: "Distribusi dan pergudangan" },
              { label: "Kantor pusat", value: "Depok, Jawa Barat" },
              {
                label: "Struktur",
                value: `${departmentCount} departemen, 5 level jabatan`,
              },
              { label: "Jam kerja", value: "Senin–Jumat, shift operasional" },
              {
                label: "Kontak karier",
                value: (
                  <a
                    href="mailto:karir@egalog.co.id"
                    className="text-accent underline-offset-2 hover:underline"
                  >
                    karir@egalog.co.id
                  </a>
                ),
              },
            ].map((item, index, all) => (
              <div
                key={item.label}
                className={`px-7 py-5 ${
                  index < all.length - 1 ? "border-b border-border" : ""
                }`}
              >
                <dt className="text-sm text-muted-foreground">{item.label}</dt>
                <dd className="mt-0.5 text-lg font-semibold">{item.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* FASILITAS */}
      <section
        id="fasilitas"
        className="scroll-mt-6 bg-surface py-14 sm:py-20 lg:py-[104px]"
      >
        <div className="mx-auto flex max-w-[1200px] flex-wrap gap-x-20 gap-y-10 px-6">
          <div className="max-w-[420px] flex-1 basis-[300px]">
            <h2 className="font-display text-[30px] font-extrabold leading-[1.08] tracking-[-0.02em] text-primary sm:text-[40px] lg:text-[48px]">
              Fasilitas untuk karyawan
            </h2>
            <p className="mt-4.5 text-[18px] leading-[1.6] text-muted-foreground">
              Berlaku untuk karyawan tetap di semua departemen.
            </p>
          </div>

          <ul className="grid flex-1 basis-[480px] grid-cols-1 gap-x-10 sm:grid-cols-2">
            {BENEFITS.map((benefit) => (
              <li
                key={benefit}
                className="flex items-start gap-3.5 border-b border-border py-5 text-[18px] leading-normal"
              >
                <CheckCircle2
                  className="mt-0.5 h-6 w-6 shrink-0 text-accent"
                  strokeWidth={1.75}
                  aria-hidden="true"
                />
                {benefit}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ALUR SELEKSI */}
      <section
        id="seleksi"
        className="scroll-mt-6 bg-background py-14 sm:py-20 lg:py-[104px]"
      >
        <div className="mx-auto flex max-w-[1200px] flex-wrap gap-x-20 gap-y-10 px-6">
          <div className="max-w-[420px] flex-1 basis-[300px]">
            <h2 className="font-display text-[30px] font-extrabold leading-[1.08] tracking-[-0.02em] text-primary sm:text-[40px] lg:text-[48px]">
              Alur seleksi
            </h2>
            <p className="mt-4.5 text-[18px] leading-[1.6] text-muted-foreground">
              Empat tahap, dari kirim lamaran sampai hari pertama kerja.
            </p>
          </div>

          <ol className="flex-1 basis-[480px]">
            {HIRING_STEPS.map((step, index) => (
              <li
                key={step.title}
                className={`flex items-start gap-5 border-t border-[#d9d5cb] py-6 ${
                  index === HIRING_STEPS.length - 1 ? "border-b" : ""
                }`}
              >
                <div
                  aria-hidden="true"
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full font-display text-[19px] font-extrabold ${
                    index === HIRING_STEPS.length - 1
                      ? "bg-accent text-white"
                      : "bg-primary text-primary-foreground"
                  }`}
                >
                  {index + 1}
                </div>
                <div>
                  <h3 className="text-[21px] font-bold">{step.title}</h3>
                  <p className="mt-1.5 text-[18px] leading-[1.6] text-muted-foreground">
                    {step.body}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-accent py-14 text-white sm:py-20 lg:py-[88px]">
        <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-x-12 gap-y-8 px-6">
          <div className="flex-1 basis-[480px]">
            <h2 className="font-display text-[28px] font-extrabold leading-[1.1] tracking-[-0.02em] sm:text-[36px] lg:text-[44px]">
              Belum ada posisi yang cocok?
            </h2>
            <p className="mt-4 max-w-[600px] text-[19px] leading-[1.6] text-white/90">
              Kirim CV dan ceritakan singkat pengalamanmu ke karir@egalog.co.id.
              Datanya kami simpan untuk pembukaan berikutnya.
            </p>
          </div>
          <a
            href="mailto:karir@egalog.co.id"
            className="inline-flex min-h-[54px] items-center gap-2.5 rounded-[6px] bg-background px-6 text-[17px] font-bold text-primary transition-colors hover:bg-white"
          >
            Kirim CV lewat email
            <ArrowRight className="h-5 w-5" strokeWidth={2} aria-hidden="true" />
          </a>
        </div>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "PT EgaLog Indonesia",
            description:
              "Perusahaan distribusi dan pergudangan yang melayani klien korporat di Jabodetabek.",
            address: {
              "@type": "PostalAddress",
              addressLocality: "Depok",
              addressRegion: "Jawa Barat",
              addressCountry: "ID",
            },
            email: "karir@egalog.co.id",
            numberOfEmployees: {
              "@type": "QuantitativeValue",
              value: activeEmployees.length,
            },
            department: [
              { "@type": "Organization", name: "Operasional" },
              { "@type": "Organization", name: "Armada" },
              { "@type": "Organization", name: "Sales" },
              { "@type": "Organization", name: "Finance" },
              { "@type": "Organization", name: "HR & GA" },
              { "@type": "Organization", name: "IT" },
            ],
          }),
        }}
      />
    </div>
  );
}
