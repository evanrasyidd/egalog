"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Loader2, TriangleAlert } from "lucide-react";

const ALLOWED_FILE_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

const FIELD_CLASS =
  "w-full rounded-[6px] border-[1.5px] border-[#7d859a] bg-surface px-4 text-[17px] text-primary outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary";

export function PublicApplyForm({ jobPostingId }: { jobPostingId: string }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [resumeNote, setResumeNote] = useState("");
  const [resumeFile, setResumeFile] = useState<string | null>(null);
  const [resumeFileName, setResumeFileName] = useState("");
  const [fileError, setFileError] = useState<string | null>(null);
  // Honeypot: field tersembunyi dari manusia (CSS + aria-hidden), tapi bot
  // form-filler otomatis biasanya tetap mengisi semua input yang mereka
  // temukan di DOM. Kalau field ini terisi, kita diam-diam tolak submit-nya
  // tanpa kasih tau alasan ke si pengirim (supaya bot nggak belajar
  // menghindarinya di percobaan berikutnya).
  const [website, setWebsite] = useState("");
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!consent) {
      setError("Centang persetujuan pemrosesan data sebelum mengirim lamaran.");
      return;
    }

    if (website.trim() !== "") {
      // Kemungkinan besar bot — pura-pura sukses, jangan kasih sinyal apapun.
      setIsSuccess(true);
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/karir/lowongan/${jobPostingId}/lamar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone,
          resumeNote,
          resumeFile,
          consent,
          website,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.message ?? "Gagal mengirim lamaran. Coba lagi.");
        return;
      }

      setIsSuccess(true);
    } catch {
      setError("Terjadi kesalahan jaringan. Coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isSuccess) {
    return (
      <div className="flex items-start gap-3 rounded-[6px] border border-success/25 bg-success/10 px-4 py-3.5 text-base leading-relaxed text-success">
        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" strokeWidth={1.75} />
        <span>
          Lamaran kamu berhasil dikirim. Tim HR EgaLog akan menghubungi kamu
          lewat email/telepon kalau profil kamu cocok dengan posisi ini.
        </span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <label htmlFor="apply-name" className="text-base font-semibold">
          Nama lengkap
        </label>
        <input
          id="apply-name"
          type="text"
          required
          minLength={2}
          maxLength={150}
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={`${FIELD_CLASS} h-[52px]`}
        />
      </div>

      <div className="flex flex-wrap gap-5">
        <div className="flex min-w-[240px] flex-1 flex-col gap-2">
          <label htmlFor="apply-email" className="text-base font-semibold">
            Email
          </label>
          <input
            id="apply-email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`${FIELD_CLASS} h-[52px]`}
          />
        </div>
        <div className="flex min-w-[240px] flex-1 flex-col gap-2">
          <label htmlFor="apply-phone" className="text-base font-semibold">
            No. HP
          </label>
          <input
            id="apply-phone"
            type="tel"
            required
            minLength={6}
            maxLength={30}
            autoComplete="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="0812xxxxxxx"
            className={`${FIELD_CLASS} h-[52px]`}
          />
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="apply-resume" className="text-base font-semibold">
          Pengalaman kerja
        </label>
        <textarea
          id="apply-resume"
          required
          minLength={10}
          maxLength={2000}
          rows={5}
          value={resumeNote}
          onChange={(e) => setResumeNote(e.target.value)}
          placeholder="Ceritakan pengalaman kerja, pendidikan terakhir, atau hal lain yang relevan"
          className={`${FIELD_CLASS} resize-y py-3.5 leading-[1.5]`}
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="apply-cv" className="text-base font-semibold">
          CV{" "}
          <span className="font-normal text-muted-foreground">
            (PDF atau DOC, boleh dikosongkan)
          </span>
        </label>
        <input
          id="apply-cv"
          type="file"
          accept=".pdf,.doc,.docx"
          onChange={(e) => {
            const file = e.target.files?.[0];
            setFileError(null);
            if (!file) {
              setResumeFile(null);
              setResumeFileName("");
              return;
            }
            // Batas 2MB — store in-memory pakai data URL, jadi harus dibatasi
            // biar payload JSON gak membengkak rusak performa server demo.
            if (file.size > 2 * 1024 * 1024) {
              setFileError("Ukuran file maksimal 2 MB.");
              e.target.value = "";
              return;
            }
            if (!ALLOWED_FILE_TYPES.has(file.type)) {
              setFileError("Format file harus PDF, DOC, atau DOCX.");
              e.target.value = "";
              return;
            }
            const reader = new FileReader();
            reader.onload = () => {
              setResumeFile(reader.result as string);
              setResumeFileName(file.name);
            };
            reader.readAsDataURL(file);
          }}
          className="w-full rounded-[6px] border-[1.5px] border-dashed border-[#7d859a] bg-background px-4 py-3 text-base text-primary file:mr-3 file:rounded-[4px] file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-primary-foreground"
        />
        {resumeFileName && (
          <p className="text-sm text-muted-foreground">Terpilih: {resumeFileName}</p>
        )}
        {fileError && <p className="text-sm text-danger">{fileError}</p>}
      </div>

      <div className="flex items-start gap-3">
        <input
          id="apply-consent"
          type="checkbox"
          required
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          className="mt-0.5 h-[22px] w-[22px] shrink-0 rounded-[4px] accent-accent"
        />
        <label
          htmlFor="apply-consent"
          className="text-base leading-[1.55] text-[#33405a]"
        >
          Saya setuju data yang saya kirim (nama, kontak, CV, dan pengalaman
          kerja) diproses EgaLog untuk keperluan rekrutmen. Baca{" "}
          <Link href="/privasi" className="font-semibold text-accent hover:underline">
            kebijakan privasi
          </Link>
          .
        </label>
      </div>

      {/* Honeypot — disembunyikan dari manusia, "terlihat" oleh bot form-filler. */}
      <div className="hidden" aria-hidden="true">
        <label htmlFor="apply-website">Website</label>
        <input
          id="apply-website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
        />
      </div>

      {error && (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-[6px] border border-danger/30 bg-danger/10 px-4 py-3 text-base text-danger"
        >
          <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={1.75} />
          <span>{error}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex min-h-[54px] items-center gap-2.5 rounded-[6px] bg-accent px-7 text-[17px] font-bold text-accent-foreground transition-colors hover:bg-accent/90 disabled:opacity-60"
      >
        Kirim lamaran
        {isSubmitting ? (
          <Loader2 className="h-5 w-5 animate-spin" strokeWidth={2} />
        ) : (
          <ArrowRight className="h-5 w-5" strokeWidth={2} aria-hidden="true" />
        )}
      </button>
    </form>
  );
}
