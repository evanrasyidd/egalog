type Tone = "success" | "warning" | "danger" | "neutral";

const TONE_CLASSES: Record<Tone, string> = {
  success: "bg-success/10 text-success border-success/25",
  warning: "bg-warning/10 text-warning border-warning/25",
  danger: "bg-danger/10 text-danger border-danger/25",
  neutral: "bg-surface-muted text-muted-foreground border-border",
};

const ATTENDANCE_TONE: Record<string, Tone> = {
  hadir: "success",
  terlambat: "warning",
  alpha: "danger",
};

const LEAVE_TONE: Record<string, Tone> = {
  disetujui: "success",
  menunggu: "warning",
  ditolak: "danger",
};

const REVIEW_TONE: Record<string, Tone> = {
  draft: "warning",
  selesai: "success",
};

const CANDIDATE_TONE: Record<string, Tone> = {
  lamar: "neutral",
  interview: "warning",
  offer: "warning",
  diterima: "success",
};

const JOB_TONE: Record<string, Tone> = {
  dibuka: "success",
  ditutup: "neutral",
};

const EMPLOYEE_STATUS_TONE: Record<string, Tone> = {
  aktif: "success",
  nonaktif: "neutral",
};

const LABELS: Record<string, string> = {
  hadir: "Hadir",
  terlambat: "Terlambat",
  alpha: "Alpha",
  disetujui: "Disetujui",
  menunggu: "Menunggu",
  ditolak: "Ditolak",
  draft: "Draft",
  selesai: "Selesai",
  lamar: "Lamar",
  interview: "Interview",
  offer: "Offer",
  diterima: "Diterima",
  dibuka: "Dibuka",
  ditutup: "Ditutup",
  aktif: "Aktif",
  nonaktif: "Nonaktif",
};

export function StatusBadge({ status }: { status: string }) {
  const tone =
    ATTENDANCE_TONE[status] ??
    LEAVE_TONE[status] ??
    REVIEW_TONE[status] ??
    CANDIDATE_TONE[status] ??
    JOB_TONE[status] ??
    EMPLOYEE_STATUS_TONE[status] ??
    "neutral";
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${TONE_CLASSES[tone]}`}
    >
      {LABELS[status] ?? status}
    </span>
  );
}
