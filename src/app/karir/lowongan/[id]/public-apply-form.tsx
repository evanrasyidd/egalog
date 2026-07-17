"use client";

import { useState } from "react";
import { Loader2, Send, TriangleAlert, CheckCircle2 } from "lucide-react";

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
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

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
        body: JSON.stringify({ name, email, phone, resumeNote, resumeFile }),
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
      <div className="flex items-start gap-2.5 rounded-[10px] bg-success/10 border border-success/25 px-4 py-3.5 text-sm text-success">
        <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" strokeWidth={1.75} />
        <span>
          Lamaran kamu berhasil dikirim. Tim HR EgaLog akan menghubungi kamu
          lewat email/telepon kalau profil kamu cocok dengan posisi ini.
        </span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <label htmlFor="apply-name" className="text-sm font-medium">
          Nama Lengkap
        </label>
        <input
          id="apply-name"
          type="text"
          required
          minLength={2}
          maxLength={150}
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-[10px] border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label htmlFor="apply-email" className="text-sm font-medium">
            Email
          </label>
          <input
            id="apply-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-[10px] border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="apply-phone" className="text-sm font-medium">
            No. HP
          </label>
          <input
            id="apply-phone"
            type="tel"
            required
            minLength={6}
            maxLength={30}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="0812xxxxxxx"
            className="w-full rounded-[10px] border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="apply-resume" className="text-sm font-medium">
          Ceritakan Pengalaman Kamu
        </label>
        <textarea
          id="apply-resume"
          required
          minLength={10}
          maxLength={2000}
          rows={4}
          value={resumeNote}
          onChange={(e) => setResumeNote(e.target.value)}
          placeholder="Pengalaman kerja, pendidikan terakhir, atau hal lain yang relevan..."
          className="w-full rounded-[10px] border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary resize-none"
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="apply-cv" className="text-sm font-medium">
          Unggah CV (PDF/DOC, opsional)
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
            const reader = new FileReader();
            reader.onload = () => {
              setResumeFile(reader.result as string);
              setResumeFileName(file.name);
            };
            reader.readAsDataURL(file);
          }}
          className="w-full rounded-[10px] border border-border bg-background px-3.5 py-2.5 text-sm file:mr-3 file:rounded-[8px] file:border-0 file:bg-primary/10 file:px-3 file:py-1.5 file:text-sm file:text-primary"
        />
        {resumeFileName && (
          <p className="text-xs text-muted-foreground">Terpilih: {resumeFileName}</p>
        )}
        {fileError && (
          <p className="text-xs text-danger">{fileError}</p>
        )}
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
          className="flex items-start gap-2 rounded-[10px] bg-danger/10 border border-danger/30 px-3.5 py-2.5 text-sm text-danger"
        >
          <TriangleAlert className="h-4 w-4 mt-0.5 shrink-0" strokeWidth={1.75} />
          <span>{error}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="flex items-center gap-2 rounded-[10px] bg-primary text-primary-foreground px-4 py-2.5 text-sm font-medium hover:bg-primary-soft transition-colors disabled:opacity-60"
      >
        {isSubmitting ? (
          <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} />
        ) : (
          <Send className="h-4 w-4" strokeWidth={1.75} />
        )}
        Kirim Lamaran
      </button>
    </form>
  );
}
