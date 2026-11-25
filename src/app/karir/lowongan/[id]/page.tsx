import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowDown, ArrowLeft, ArrowRight } from "lucide-react";
import { findJobPostingById, getOpenJobPostings, isJobOpen } from "@/lib/recruitment";
import { DEPARTMENT_LABEL } from "@/lib/types";
import { EMPLOYMENT_TYPE_LABEL, WORK_ARRANGEMENT_LABEL } from "@/lib/labels";
import { formatDateID } from "@/lib/date";
import { serializeJsonLd } from "@/lib/json-ld";
import { PublicApplyForm } from "./public-apply-form";

export const revalidate = 60;

const EMPLOYMENT_TYPE_SCHEMA: Record<string, string> = {
  full_time: "FULL_TIME",
  kontrak: "CONTRACTOR",
  magang: "INTERN",
};

const FACILITIES = [
  "BPJS Kesehatan dan Ketenagakerjaan.",
  "Cuti tahunan dan cuti bersama.",
  "Tunjangan transport dan makan harian.",
  "Pelatihan internal dan rotasi lintas divisi.",
];

/**
 * Data lowongan disimpan sebagai teks bebas dari form HR. Hanya pecah jadi
 * poin kalau HR memang menulis daftar (baris baru atau titik koma). Jangan
 * pecah berdasarkan koma: "Min. S1 Psikologi/Manajemen SDM, 2 tahun
 * pengalaman..." adalah satu kualifikasi, bukan dua.
 */
function toPoints(text: string): string[] {
  const clean = (value: string) => value.replace(/^[-•*]\s*/, "").trim();
  const lines = text
    .split(/\r?\n/)
    .map(clean)
    .filter(Boolean);
  if (lines.length > 1) return lines;

  const parts = text
    .split(/\s*;\s*/)
    .map(clean)
    .filter(Boolean);
  if (parts.length > 1) return parts;

  return [text.trim()];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const posting = findJobPostingById(id);
  if (!posting || !isJobOpen(posting)) {
    return { title: "Lowongan tidak ditemukan", robots: { index: false, follow: false } };
  }

  const title = `${posting.title} — ${DEPARTMENT_LABEL[posting.department]}`;
  const description = `${posting.description.slice(0, 150)}… Lamar posisi ${posting.title} di PT EgaLog Indonesia, ${posting.location}.`;

  return {
    title,
    description,
    alternates: { canonical: `/karir/lowongan/${posting.id}` },
    robots: { index: true, follow: true },
    openGraph: {
      type: "article",
      title: `${posting.title} · Karier EgaLog`,
      description,
      url: `/karir/lowongan/${posting.id}`,
      images: [{ url: "/og-karir.png", width: 1200, height: 630, alt: `Lowongan ${posting.title}` }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${posting.title} · Karier EgaLog`,
      description,
      images: ["/og-karir.png"],
    },
  };
}

export default async function KarirLowonganDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const posting = findJobPostingById(id);

  // Lowongan yang sudah ditutup / lewat deadline tidak boleh terlihat atau
  // dilamar dari halaman publik — cukup 404.
  if (!posting || !isJobOpen(posting)) notFound();

  const openPostings = getOpenJobPostings();
  const similar = openPostings
    .filter((job) => job.id !== posting.id)
    .sort((a, b) => {
      const aSame = a.department === posting.department ? 0 : 1;
      const bSame = b.department === posting.department ? 0 : 1;
      return aSame - bSame || b.createdAt.localeCompare(a.createdAt);
    })
    .slice(0, 3);

  const responsibilities = toPoints(posting.description);
  const qualifications = toPoints(posting.requirements);

  const shareText = encodeURIComponent(
    `${posting.title} — Karier EgaLog. Lamar di sini: `,
  );

  const summary = [
    { label: "Departemen", value: DEPARTMENT_LABEL[posting.department] },
    { label: "Tipe kerja", value: EMPLOYMENT_TYPE_LABEL[posting.employmentType] },
    { label: "Sistem kerja", value: WORK_ARRANGEMENT_LABEL[posting.workArrangement] },
    { label: "Lokasi", value: posting.location },
    { label: "Gaji", value: posting.salaryRange ?? "Dirahasiakan" },
    {
      label: "Batas lamaran",
      value: posting.deadline ? formatDateID(posting.deadline) : "Tanpa batas",
    },
    {
      label: "Dipublikasikan",
      value: formatDateID(posting.createdAt.slice(0, 10)),
    },
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: posting.title,
    description: `<p>${posting.description}</p><p><strong>Kualifikasi:</strong> ${posting.requirements}</p>`,
    datePosted: posting.createdAt,
    ...(posting.deadline ? { validThrough: `${posting.deadline}T23:59:59+07:00` } : {}),
    employmentType: EMPLOYMENT_TYPE_SCHEMA[posting.employmentType] ?? "FULL_TIME",
    hiringOrganization: {
      "@type": "Organization",
      name: "PT EgaLog Indonesia",
      sameAs: process.env.NEXT_PUBLIC_SITE_URL ?? "https://egalog.co.id",
    },
    jobLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        streetAddress: posting.location,
        addressLocality: "Depok",
        addressRegion: "Jawa Barat",
        addressCountry: "ID",
      },
    },
    ...(posting.salaryRange
      ? {
          baseSalary: {
            "@type": "MonetaryAmount",
            currency: "IDR",
            value: { "@type": "QuantitativeValue", description: posting.salaryRange },
          },
        }
      : {}),
    directApply: true,
  };

  return (
    <div>
      {/* HERO POSISI */}
      <section className="border-b border-border bg-background py-8 sm:py-12 lg:pb-[72px]">
        <div className="mx-auto max-w-[1200px] px-6">
          <Link
            href="/karir#lowongan"
            className="inline-flex min-h-11 items-center gap-2 text-base font-semibold text-accent transition-colors hover:text-primary"
          >
            <ArrowLeft className="h-[18px] w-[18px]" strokeWidth={2} aria-hidden="true" />
            Kembali ke semua lowongan
          </Link>

          <p className="mb-2.5 mt-7 text-base font-semibold text-accent">
            {DEPARTMENT_LABEL[posting.department]}
          </p>
          <h1 className="font-display text-[38px] font-extrabold leading-[1.04] tracking-[-0.03em] text-primary sm:text-[56px] lg:text-[72px]">
            {posting.title}
          </h1>

          <div className="mt-7 flex flex-wrap gap-x-3.5 gap-y-2.5">
            <span className="inline-flex min-h-[38px] items-center rounded-[6px] bg-surface px-3.5 text-base font-medium">
              {EMPLOYMENT_TYPE_LABEL[posting.employmentType]}
            </span>
            <span className="inline-flex min-h-[38px] items-center rounded-[6px] bg-surface px-3.5 text-base font-medium">
              {WORK_ARRANGEMENT_LABEL[posting.workArrangement]}
            </span>
            <span className="inline-flex min-h-[38px] items-center rounded-[6px] bg-surface px-3.5 text-base font-medium">
              {posting.location}
            </span>
            {posting.salaryRange && (
              <span className="inline-flex min-h-[38px] items-center rounded-[6px] bg-surface px-3.5 text-base font-semibold">
                {posting.salaryRange}
              </span>
            )}
            <span className="inline-flex min-h-[38px] items-center rounded-[6px] bg-primary px-3.5 text-base font-semibold text-primary-foreground">
              {posting.deadline
                ? `Tutup ${formatDateID(posting.deadline)}`
                : "Tanpa batas lamaran"}
            </span>
          </div>
        </div>
      </section>

      {/* KONTEN + FORM */}
      <section className="py-10 sm:py-14 lg:pb-24 lg:pt-[72px]">
        <div className="mx-auto flex max-w-[1200px] flex-wrap items-start justify-between gap-x-16 gap-y-12 px-6">
          <div className="max-w-[720px] flex-1 basis-[560px]">
            <h2 className="font-display text-[26px] font-bold tracking-[-0.01em]">
              Tanggung jawab
            </h2>
            {responsibilities.length > 1 ? (
              <ul className="mt-4 list-disc space-y-1 pl-[22px] text-[18px] leading-[1.75] text-[#33405a]">
                {responsibilities.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 text-[18px] leading-[1.75] text-[#33405a]">
                {responsibilities[0]}
              </p>
            )}

            <h2 className="mt-11 font-display text-[26px] font-bold tracking-[-0.01em]">
              Kualifikasi
            </h2>
            {qualifications.length > 1 ? (
              <ul className="mt-4 list-disc space-y-1 pl-[22px] text-[18px] leading-[1.75] text-[#33405a]">
                {qualifications.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 text-[18px] leading-[1.75] text-[#33405a]">
                {qualifications[0]}
              </p>
            )}

            <h2 className="mt-11 font-display text-[26px] font-bold tracking-[-0.01em]">
              Fasilitas
            </h2>
            <ul className="mt-4 list-disc space-y-1 pl-[22px] text-[18px] leading-[1.75] text-[#33405a]">
              {FACILITIES.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>

            <div
              id="lamar"
              className="mt-16 scroll-mt-6 rounded-[8px] bg-surface p-6 sm:p-10"
            >
              <h2 className="font-display text-[30px] font-extrabold tracking-[-0.02em]">
                Lamar posisi ini
              </h2>
              <p className="mt-2 text-[17px] leading-[1.55] text-muted-foreground">
                Tidak perlu akun. Tim HR akan menghubungi lewat email atau telepon.
              </p>
              <div className="mt-7">
                <PublicApplyForm jobPostingId={posting.id} />
              </div>
            </div>
          </div>

          <aside
            aria-label="Ringkasan posisi"
            className="flex min-w-[min(100%,300px)] flex-[0_1_380px] flex-col gap-5 self-start lg:sticky lg:top-6"
          >
            <div className="rounded-[8px] bg-surface">
              <p className="border-b border-border px-6 py-[22px] text-[18px] font-bold">
                Ringkasan posisi
              </p>
              <dl className="m-0">
                {summary.map((item) => (
                  <div
                    key={item.label}
                    className="flex justify-between gap-4 border-b border-border px-6 py-3.5"
                  >
                    <dt className="text-base text-muted-foreground">{item.label}</dt>
                    <dd className="m-0 text-right text-base font-semibold">
                      {item.value}
                    </dd>
                  </div>
                ))}
              </dl>
              <div className="px-6 py-[22px]">
                <a
                  href="#lamar"
                  className="flex min-h-[54px] items-center justify-center gap-2.5 rounded-[6px] bg-accent text-[17px] font-bold text-accent-foreground transition-colors hover:bg-accent/90"
                >
                  Lamar posisi ini
                  <ArrowDown className="h-5 w-5" strokeWidth={2} aria-hidden="true" />
                </a>
              </div>
            </div>

            <div className="rounded-[8px] bg-surface px-6 py-[22px]">
              <p className="text-[18px] font-bold">Bagikan lowongan ini</p>
              <div className="mt-3.5 flex flex-wrap gap-2.5">
                <a
                  href={`https://wa.me/?text=${shareText}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-11 items-center rounded-[6px] border-[1.5px] border-primary px-4 text-base font-semibold transition-colors hover:bg-primary hover:text-primary-foreground"
                >
                  WhatsApp
                </a>
                <a
                  href={`mailto:?subject=${encodeURIComponent(posting.title)}&body=${shareText}`}
                  className="inline-flex min-h-11 items-center rounded-[6px] border-[1.5px] border-primary px-4 text-base font-semibold transition-colors hover:bg-primary hover:text-primary-foreground"
                >
                  Email
                </a>
              </div>
            </div>
          </aside>
        </div>
      </section>

      {/* POSISI LAIN */}
      {similar.length > 0 && (
        <section className="bg-surface py-12 sm:py-16 lg:py-20">
          <div className="mx-auto max-w-[1200px] px-6">
            <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-3">
              <h2 className="font-display text-[26px] font-extrabold tracking-[-0.02em] sm:text-[32px] lg:text-[38px]">
                Posisi lain di EgaLog
              </h2>
              <Link
                href="/karir#lowongan"
                className="text-[17px] font-semibold text-accent hover:underline"
              >
                Lihat semua lowongan
              </Link>
            </div>

            <div className="mt-7 border-b border-border">
              {similar.map((job) => (
                <Link
                  key={job.id}
                  href={`/karir/lowongan/${job.id}`}
                  className="group flex flex-wrap items-center justify-between gap-x-8 gap-y-3 border-t border-border px-4 py-6 transition-colors hover:bg-background"
                >
                  <div>
                    <p className="font-display text-[22px] font-bold tracking-[-0.01em] sm:text-[24px]">
                      {job.title}
                    </p>
                    <p className="mt-1 text-base text-muted-foreground">
                      {DEPARTMENT_LABEL[job.department]} ·{" "}
                      {WORK_ARRANGEMENT_LABEL[job.workArrangement]} · {job.location}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-base font-semibold">
                      {job.deadline
                        ? `Tutup ${formatDateID(job.deadline, {
                            day: "numeric",
                            month: "short",
                          })}`
                        : "Tanpa batas"}
                    </span>
                    <ArrowRight
                      className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-accent"
                      strokeWidth={1.75}
                      aria-hidden="true"
                    />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
      />
    </div>
  );
}
