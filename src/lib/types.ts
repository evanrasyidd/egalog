// Domain types untuk EgaLog HR
// Hierarki role sengaja direpresentasikan sebagai level angka (1 = tertinggi)
// supaya logic approval & visibility data bisa dibandingkan secara numerik,
// bukan di-hardcode string per kasus.

export type Role = "owner" | "direktur" | "manager" | "supervisor" | "staff";

export const ROLE_LEVEL: Record<Role, number> = {
  owner: 1,
  direktur: 2,
  manager: 3,
  supervisor: 4,
  staff: 5,
};

export const ROLE_LABEL: Record<Role, string> = {
  owner: "Owner",
  direktur: "Direktur",
  manager: "Manager",
  supervisor: "Supervisor",
  staff: "Staff",
};

export type Department =
  | "operasional"
  | "armada"
  | "sales"
  | "finance"
  | "hr"
  | "it";

export const DEPARTMENT_LABEL: Record<Department, string> = {
  operasional: "Operasional & Gudang",
  armada: "Armada & Distribusi",
  sales: "Sales & Partnership",
  finance: "Finance & Accounting",
  hr: "HR & GA",
  it: "IT & Sistem",
};

export interface Employee {
  id: string;
  nip: string; // Nomor Induk Pegawai
  name: string;
  email: string;
  passwordHash: string;
  role: Role;
  department: Department;
  jobTitle: string;
  managerId: string | null; // atasan langsung, null untuk owner
  joinedAt: string; // ISO date
  leaveBalance: number; // sisa jatah cuti tahunan (hari)
  avatarColor: string; // warna solid untuk avatar inisial (dipakai kalau avatarPhoto kosong)
  avatarPhoto: string | null; // data URL foto profil (opsional), override avatarColor+inisial kalau ada
  isActive: boolean; // false = resign/nonaktif — tidak bisa login, disembunyikan dari org chart & direktori
  baseSalary: number; // gaji pokok bulanan (IDR)
}

export type AttendanceStatus = "hadir" | "terlambat" | "alpha";

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  date: string; // YYYY-MM-DD
  clockIn: string | null; // ISO datetime
  clockOut: string | null; // ISO datetime
  clockInLocation: { lat: number; lng: number } | null;
  clockOutLocation: { lat: number; lng: number } | null;
  selfieClockIn: string | null; // data URL (base64 JPEG), diambil dari kamera saat absen masuk
  selfieClockOut: string | null; // data URL (base64 JPEG), diambil dari kamera saat absen pulang
  status: AttendanceStatus;
  note?: string;
}

export type LeaveType = "cuti_tahunan" | "sakit" | "izin";
export type LeaveStatus = "menunggu" | "disetujui" | "ditolak";

export interface LeaveApprovalStep {
  approverId: string;
  approverRole: Role;
  decision: "menunggu" | "disetujui" | "ditolak";
  decidedAt: string | null;
  comment?: string;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  type: LeaveType;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  reason: string;
  status: LeaveStatus;
  createdAt: string;
  approvalChain: LeaveApprovalStep[];
  currentStepIndex: number;
}

export type SessionPayload =
  | { type: "employee"; sub: string; role: Role; name: string; department: Department }
  | { type: "admin"; sub: string; name: string };

// ---------------------------------------------------------------------------
// Admin — akun sistem TERPISAH dari struktur karyawan/org chart. Tidak punya
// atasan, tidak di-review, tidak absen/cuti seperti karyawan biasa. Murni
// buat kelola data (Karyawan, Payroll, Rekrutmen) dengan akses penuh, tanpa
// terikat batasan departemen/garis komando manapun.
// ---------------------------------------------------------------------------
export interface AdminAccount {
  id: string;
  username: string;
  passwordHash: string;
  name: string;
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Payroll
// ---------------------------------------------------------------------------

export interface PayslipEarnings {
  baseSalary: number;
  allowanceTransport: number; // dihitung per hari hadir aktual
  allowanceMeal: number; // dihitung per hari hadir aktual
  allowancePosition: number; // tunjangan jabatan tetap (Supervisor ke atas)
  overtimePay: number; // dihitung dari selisih jam pulang - jam masuk
  overtimeHours: number;
}

export interface PayslipDeductions {
  bpjs: number; // estimasi, bukan perhitungan BPJS resmi
  incomeTax: number; // estimasi PPh21, bukan perhitungan TER resmi
  latePenalty: number;
  absencePenalty: number; // potongan alpha (hari kerja tanpa absen & tanpa cuti disetujui)
}

export interface PayslipAttendanceSummary {
  workingDays: number;
  presentDays: number;
  lateDays: number;
  leaveDays: number;
  alphaDays: number;
}

export interface Payslip {
  id: string;
  employeeId: string;
  period: string; // "YYYY-MM"
  earnings: PayslipEarnings;
  deductions: PayslipDeductions;
  attendance: PayslipAttendanceSummary;
  grossPay: number;
  totalDeductions: number;
  netPay: number;
  generatedAt: string;
  generatedBy: string; // employeeId yang men-generate (Finance/Direktur/Owner)
}

// ---------------------------------------------------------------------------
// Performance Review
// ---------------------------------------------------------------------------

export const COMPETENCIES = [
  "kualitas_kerja",
  "kedisiplinan",
  "kolaborasi",
  "inisiatif",
] as const;

export type Competency = (typeof COMPETENCIES)[number];

export const COMPETENCY_LABEL: Record<Competency, string> = {
  kualitas_kerja: "Kualitas Kerja",
  kedisiplinan: "Kedisiplinan & Kehadiran",
  kolaborasi: "Kolaborasi Tim",
  inisiatif: "Inisiatif",
};

export type ReviewStatus = "draft" | "selesai";

export interface PerformanceReview {
  id: string;
  employeeId: string;
  reviewerId: string; // atasan langsung yang mengisi
  cycle: string; // "YYYY-Q#"
  scores: Record<Competency, number>; // masing-masing 1-5
  overallScore: number; // rata-rata, dihitung otomatis
  strengths: string;
  areasForImprovement: string;
  status: ReviewStatus;
  createdAt: string;
  submittedAt: string | null;
}

export type GoalStatus = "belum_mulai" | "berjalan" | "tercapai" | "tidak_tercapai";

export interface Goal {
  id: string;
  employeeId: string;
  cycle: string; // siklus saat goal dibuat
  title: string;
  description: string;
  status: GoalStatus;
  createdBy: string; // atasan yang membuat
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// Recruitment
// ---------------------------------------------------------------------------

export type EmploymentType = "full_time" | "kontrak" | "magang";
export type JobStatus = "dibuka" | "ditutup";

export interface JobPosting {
  id: string;
  title: string;
  department: Department;
  employmentType: EmploymentType;
  description: string;
  requirements: string;
  status: JobStatus;
  createdBy: string;
  createdAt: string;
}

export type CandidateStage = "lamar" | "interview" | "offer" | "diterima" | "ditolak";

export interface Candidate {
  id: string;
  jobPostingId: string;
  name: string;
  email: string;
  phone: string;
  resumeNote: string; // ringkasan CV/pengalaman, input teks manual oleh HR
  resumeFile: string | null; // data URL file CV (pdf/doc) yg diupload pelamar
  stage: CandidateStage;
  notes: string;
  appliedAt: string;
  updatedAt: string;
  updatedBy: string;
}

