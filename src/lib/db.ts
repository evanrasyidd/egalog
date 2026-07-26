import bcrypt from "bcryptjs";
import { BASE_SALARY_BY_ROLE } from "./payroll-config";
import type {
  Employee,
  AttendanceRecord,
  LeaveRequest,
  Payslip,
  PerformanceReview,
  Goal,
  JobPosting,
  Candidate,
  AdminAccount,
  Notification,
  Holiday,
  Announcement,
  SystemSettings,
  Role,
  Department,
} from "./types";

// ---------------------------------------------------------------------------
// PENTING: Ini in-memory store untuk kebutuhan portfolio/demo, BUKAN database
// production. Data reset setiap kali server process benar-benar restart.
// Kalau project ini mau dipakai untuk operasional nyata, ganti layer ini
// dengan database persisten (Postgres + Prisma/Drizzle) sebelum go-live.
//
// CATATAN TEKNIS PENTING: state disimpan di `globalThis`, BUKAN sebagai
// `export const` biasa. Next.js (khususnya dengan Turbopack) bisa membundel
// route handler (app/api/**) dan Server Component (page.tsx) sebagai chunk
// modul yang terpisah — kalau state cuma berupa `let`/`const` di top-level
// modul, tiap chunk bisa dapat INSTANCE ARRAY SENDIRI-SENDIRI, sehingga data
// yang ditulis lewat API route tidak kelihatan di halaman. Dengan
// menyimpannya di `globalThis` (satu proses Node.js = satu `globalThis`),
// semua chunk modul dijamin merujuk ke objek yang sama persis.
// ---------------------------------------------------------------------------

const DEMO_PASSWORD = "egalog123";

function emp(
  id: string,
  nip: string,
  name: string,
  role: Role,
  department: Department,
  jobTitle: string,
  managerId: string | null,
  avatarColor: string,
  joinedAt: string,
  leaveBalance = 12,
  passwordHash: string,
  isActive = true,
): Employee {
  return {
    id,
    nip,
    name,
    email: `${id}@egalog.co.id`,
    passwordHash,
    role,
    department,
    jobTitle,
    managerId,
    joinedAt,
    leaveBalance,
    avatarColor,
    avatarPhoto: null,
    isActive,
    baseSalary: BASE_SALARY_BY_ROLE[role],
  };
}

interface Counters {
  attendance: number;
  leave: number;
  payslip: number;
  review: number;
  goal: number;
  job: number;
  candidate: number;
  notification: number;
  announcement: number;
  employeeSequence: number;
  activityLog: number;
  holiday: number;
}

interface Store {
  employees: Employee[];
  attendanceRecords: AttendanceRecord[];
  leaveRequests: LeaveRequest[];
  payslips: Payslip[];
  performanceReviews: PerformanceReview[];
  goals: Goal[];
  jobPostings: JobPosting[];
  candidates: Candidate[];
  notifications: Notification[];
  holidays: Holiday[];
  announcements: Announcement[];
  systemSettings: SystemSettings;
  adminAccounts: AdminAccount[];
  activityLogEntries: ActivityLogEntry[];
  counters: Counters;
}

export interface ActivityLogEntry {
  id: string;
  type: "employee" | "payroll" | "leave" | "rekrutmen" | "pengaturan" | "holiday" | "announcement" | "system";
  actor: string;
  actorRole: string;
  action: string;
  target: string;
  createdAt: string;
}

function createInitialStore(): Store {
  const passwordHash = bcrypt.hashSync(DEMO_PASSWORD, 10);

  const employees: Employee[] = [
    emp("raka", "VTK-0001", "Raka Wibisono", "owner", "finance", "Owner & CEO", null, "#1E2A4A", "2018-01-10", 18, passwordHash),

    emp("bimo", "VTK-0002", "Bimo Satria", "direktur", "operasional", "Direktur Operasional", "raka", "#2D4159", "2018-03-01", 16, passwordHash),
    emp("nadia", "VTK-0003", "Nadia Ayu Lestari", "direktur", "finance", "Direktur Finance & Corporate", "raka", "#2D4159", "2018-03-01", 16, passwordHash),

    emp("fajar", "VTK-0010", "Fajar Ramadhan", "manager", "operasional", "Manager Operasional & Gudang", "bimo", "#3D5A80", "2019-02-11", 14, passwordHash),
    emp("yoga", "VTK-0011", "Yoga Pratama", "manager", "armada", "Manager Armada & Distribusi", "bimo", "#3D5A80", "2019-04-15", 14, passwordHash),
    emp("dian", "VTK-0012", "Dian Kusuma", "manager", "sales", "Manager Sales & Partnership", "bimo", "#3D5A80", "2019-06-01", 14, passwordHash),
    emp("sri", "VTK-0013", "Sri Wahyuni", "manager", "finance", "Manager Finance & Accounting", "nadia", "#3D5A80", "2019-02-20", 14, passwordHash),
    emp("made", "VTK-0014", "Made Suryani", "manager", "hr", "Manager HR & GA", "nadia", "#3D5A80", "2019-05-10", 14, passwordHash),
    emp("arya", "VTK-0015", "Arya Nugroho", "manager", "it", "Manager IT & Sistem", "nadia", "#3D5A80", "2020-01-06", 14, passwordHash),

    emp("andi", "VTK-0020", "Andi Firmansyah", "supervisor", "operasional", "Supervisor Gudang", "fajar", "#6B8CAE", "2020-03-02", 12, passwordHash),
    emp("rian", "VTK-0021", "Rian Hidayat", "supervisor", "armada", "Supervisor Armada", "yoga", "#6B8CAE", "2020-04-14", 12, passwordHash),
    emp("putri", "VTK-0022", "Putri Anjani", "supervisor", "sales", "Supervisor Sales", "dian", "#6B8CAE", "2020-07-01", 12, passwordHash),

    emp("dedi", "VTK-0030", "Dedi Kurniawan", "staff", "operasional", "Staff Gudang", "andi", "#B08968", "2021-02-08", 12, passwordHash),
    emp("siti", "VTK-0031", "Siti Rahma", "staff", "operasional", "Staff Gudang", "andi", "#B08968", "2021-05-19", 12, passwordHash),
    emp("bagus", "VTK-0032", "Bagus Santoso", "staff", "armada", "Driver", "rian", "#B08968", "2021-03-11", 12, passwordHash),
    emp("ayu", "VTK-0033", "Ayu Ningtyas", "staff", "sales", "Staff Sales", "putri", "#B08968", "2021-08-23", 12, passwordHash),
    emp("rendra", "VTK-0034", "Rendra Saputra", "staff", "finance", "Staff Finance", "sri", "#B08968", "2022-01-17", 12, passwordHash),
    emp("melati", "VTK-0035", "Melati Kusuma", "staff", "hr", "Staff HR", "made", "#B08968", "2022-02-14", 12, passwordHash),
    emp("fikri", "VTK-0036", "Fikri Ramadhan", "staff", "it", "Staff IT Support", "arya", "#B08968", "2022-06-06", 12, passwordHash),
  ];

  const jobPostings: JobPosting[] = [
    {
      id: "job-1",
      title: "Staff Gudang Tambahan",
      department: "operasional",
      employmentType: "full_time",
      description:
        "Membantu operasional harian gudang pusat: penerimaan barang, penyusunan stok, dan persiapan pengiriman.",
      requirements:
        "Min. SMA/SMK sederajat, terbiasa kerja fisik & shift, diutamakan berpengalaman di gudang/logistik.",
      status: "dibuka",
      createdBy: "made",
      createdAt: "2026-06-15T02:00:00.000Z",
    },
    {
      id: "job-2",
      title: "Sales Executive",
      department: "sales",
      employmentType: "full_time",
      description:
        "Mengembangkan portofolio klien korporat untuk layanan logistik & pergudangan EgaLog.",
      requirements:
        "Min. D3/S1 semua jurusan, pengalaman sales B2B minimal 1 tahun, komunikatif, punya SIM A/C.",
      status: "dibuka",
      createdBy: "made",
      createdAt: "2026-06-20T02:00:00.000Z",
    },
  ];

  const candidates: Candidate[] = [
    {
      id: "cand-1",
      jobPostingId: "job-1",
      name: "Hendra Gunawan",
      email: "hendra.gunawan@example.com",
      phone: "0812-3456-7890",
      resumeNote: "3 tahun pengalaman sebagai staff gudang di perusahaan ekspedisi.",
      resumeFile: null,
      stage: "interview",
      notes: "Interview tahap 1 dengan Supervisor Gudang dijadwalkan minggu depan.",
      appliedAt: "2026-06-18T03:00:00.000Z",
      updatedAt: "2026-06-25T03:00:00.000Z",
      updatedBy: "made",
    },
    {
      id: "cand-2",
      jobPostingId: "job-1",
      name: "Wulan Sari",
      email: "wulan.sari@example.com",
      phone: "0813-2233-4455",
      resumeNote: "Fresh graduate SMK Logistik, magang 6 bulan di gudang retail.",
      resumeFile: null,
      stage: "lamar",
      notes: "",
      appliedAt: "2026-06-28T03:00:00.000Z",
      updatedAt: "2026-06-28T03:00:00.000Z",
      updatedBy: "made",
    },
    {
      id: "cand-3",
      jobPostingId: "job-2",
      name: "Farhan Ardiansyah",
      email: "farhan.ardiansyah@example.com",
      phone: "0815-6677-8899",
      resumeNote: "2 tahun sales B2B di perusahaan distribusi FMCG, target tercapai konsisten.",
      resumeFile: null,
      stage: "offer",
      notes: "Sudah interview final dengan Manager Sales, menunggu keputusan offer.",
      appliedAt: "2026-06-10T03:00:00.000Z",
      updatedAt: "2026-07-01T03:00:00.000Z",
      updatedBy: "made",
    },
  ];

  // Admin: akun sistem tunggal, terpisah dari struktur karyawan — lihat
  // catatan di types.ts. Password demo didokumentasikan di README.
  const adminPasswordHash = bcrypt.hashSync("EgaLogAdmin123", 10);
  const adminAccounts: AdminAccount[] = [
    {
      id: "admin",
      username: "admin",
      passwordHash: adminPasswordHash,
      name: "System Administrator",
      createdAt: "2018-01-01T00:00:00.000Z",
    },
  ];

  return {
    employees,
    attendanceRecords: [],
    leaveRequests: [],
    payslips: [],
    performanceReviews: [],
    goals: [],
    jobPostings,
    candidates,
    notifications: [],
    holidays: createSeedHolidays(),
    announcements: [],
    systemSettings: {
      workStartHour: 8,
      workStartMinute: 0,
      geofenceRadiusMeters: 300,
      officeLat: -6.3844303,
      officeLng: 106.8124087,
      officeLabel: "Balai Rakyat Beji, Depok",
      dailyTransportAllowance: 50_000,
      dailyMealAllowance: 35_000,
      latePenaltyPerDay: 25_000,
      bpjsRate: 0.04,
    },
    adminAccounts,
    activityLogEntries: [],
    counters: {
      attendance: 1,
      leave: 1,
      payslip: 1,
      review: 1,
      goal: 1,
      job: jobPostings.length + 1,
      candidate: candidates.length + 1,
      notification: 1,
      announcement: 1,
      employeeSequence: 37,
      activityLog: 1,
      holiday: 21,
    },
  };
}

function createSeedHolidays(): Holiday[] {
  return [
    { date: "2026-01-01", name: "Tahun Baru 2026", isNational: true },
    { date: "2026-01-28", name: "Tahun Baru Imlek 2577", isNational: true },
    { date: "2026-03-29", name: "Hari Raya Nyepi 1948", isNational: true },
    { date: "2026-03-31", name: "Wafat Isa Almasih", isNational: true },
    { date: "2026-04-01", name: "Cuti Bersama Idul Fitri", isNational: false },
    { date: "2026-04-02", name: "Cuti Bersama Idul Fitri", isNational: false },
    { date: "2026-04-03", name: "Cuti Bersama Idul Fitri", isNational: false },
    { date: "2026-04-06", name: "Idul Fitri 1447 H", isNational: true },
    { date: "2026-04-07", name: "Idul Fitri 1447 H", isNational: true },
    { date: "2026-05-01", name: "Hari Buruh Internasional", isNational: true },
    { date: "2026-05-21", name: "Hari Raya Waisak 2570", isNational: true },
    { date: "2026-05-28", name: "Kenaikan Isa Almasih", isNational: true },
    { date: "2026-06-01", name: "Hari Lahir Pancasila", isNational: true },
    { date: "2026-06-12", name: "Idul Adha 1447 H", isNational: true },
    { date: "2026-07-03", name: "Tahun Baru Islam 1448 H", isNational: true },
    { date: "2026-08-17", name: "Hari Kemerdekaan RI", isNational: true },
    { date: "2026-09-05", name: "Maulid Nabi Muhammad SAW", isNational: true },
    { date: "2026-10-28", name: "Sumpah Pemuda", isNational: true },
    { date: "2026-12-25", name: "Hari Raya Natal", isNational: true },
    { date: "2026-12-26", name: "Cuti Bersama Natal", isNational: false },
  ];
}

const globalForStore = globalThis as unknown as { __egalogHrStore?: Store };

const store: Store = globalForStore.__egalogHrStore ?? createInitialStore();
globalForStore.__egalogHrStore = store;

export const employees = store.employees;
export const adminAccounts = store.adminAccounts;
export const attendanceRecords = store.attendanceRecords;
export const leaveRequests = store.leaveRequests;
export const payslips = store.payslips;
export const performanceReviews = store.performanceReviews;
export const goals = store.goals;
export const jobPostings = store.jobPostings;
export const candidates = store.candidates;
export const notifications = store.notifications;
export const holidays = store.holidays;
export const announcements = store.announcements;
export const systemSettings = store.systemSettings;
export const activityLogEntries = store.activityLogEntries;

export function getOfficeLocation() {
  const s = store.systemSettings;
  return { lat: s.officeLat, lng: s.officeLng, label: s.officeLabel, radiusMeters: s.geofenceRadiusMeters };
}

export function findEmployeeByEmail(email: string): Employee | undefined {
  return employees.find((e) => e.email.toLowerCase() === email.toLowerCase());
}

export function findAdminByUsername(username: string): AdminAccount | undefined {
  return adminAccounts.find((a) => a.username.toLowerCase() === username.toLowerCase());
}

export function findAdminById(id: string): AdminAccount | undefined {
  return adminAccounts.find((a) => a.id === id);
}

export function findEmployeeById(id: string): Employee | undefined {
  return employees.find((e) => e.id === id);
}

export function getDirectReports(managerId: string): Employee[] {
  return employees.filter((e) => e.managerId === managerId && e.isActive);
}

// Semua bawahan di garis komando (langsung maupun tidak langsung) — dipakai
// untuk validasi visibility data (manager hanya boleh lihat sub-tree-nya).
export function getSubordinateIds(managerId: string): Set<string> {
  const result = new Set<string>();
  const queue = [managerId];
  while (queue.length > 0) {
    const current = queue.shift()!;
    const directs = getDirectReports(current);
    for (const d of directs) {
      if (!result.has(d.id)) {
        result.add(d.id);
        queue.push(d.id);
      }
    }
  }
  return result;
}

export function nextAttendanceId(): string {
  return `att-${store.counters.attendance++}`;
}

export function nextLeaveId(): string {
  return `leave-${store.counters.leave++}`;
}

export function nextPayslipId(): string {
  return `payslip-${store.counters.payslip++}`;
}

export function nextReviewId(): string {
  return `review-${store.counters.review++}`;
}

export function nextGoalId(): string {
  return `goal-${store.counters.goal++}`;
}

export function nextJobId(): string {
  return `job-${store.counters.job++}`;
}

export function nextCandidateId(): string {
  return `cand-${store.counters.candidate++}`;
}

export function nextNip(): string {
  return `VTK-${String(store.counters.employeeSequence++).padStart(4, "0")}`;
}

export function nextNotificationId(): string {
  return `notif-${store.counters.notification++}`;
}

export function nextAnnouncementId(): string {
  return `ann-${store.counters.announcement++}`;
}

export function nextActivityLogId(): string {
  return `log-${store.counters.activityLog++}`;
}

export function nextHolidayId(): string {
  return `holiday-${store.counters.holiday++}`;
}

export function isHoliday(dateStr: string): boolean {
  return store.holidays.some((h) => h.date === dateStr);
}

export function getHolidayName(dateStr: string): string | undefined {
  return store.holidays.find((h) => h.date === dateStr)?.name;
}

// ---------------------------------------------------------------------------
// Utility helpers
// ---------------------------------------------------------------------------

export function getWorkingDaysInPeriod(period: string): string[] {
  const [year, month] = period.split("-").map(Number);
  const daysInMonth = new Date(year, month, 0).getDate();
  const dates: string[] = [];
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${period}-${String(day).padStart(2, "0")}`;
    const d = new Date(`${dateStr}T00:00:00`);
    if (d.getDay() !== 0 && d.getDay() !== 6 && !isHoliday(dateStr)) {
      dates.push(dateStr);
    }
  }
  return dates;
}
