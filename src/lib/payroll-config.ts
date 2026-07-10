import type { Role } from "./types";

// ---------------------------------------------------------------------------
// CATATAN PENTING: Semua tarif di file ini adalah SIMPLIFIKASI untuk keperluan
// demo/portfolio. Ini BUKAN perhitungan BPJS atau PPh21 yang sesuai peraturan
// resmi Indonesia (yang sebenarnya pakai skema TER, tarif progresif berjenjang,
// PTKP per status pernikahan/tanggungan, dll — jauh lebih kompleks).
// Jangan pakai angka-angka ini untuk payroll perusahaan sungguhan.
// ---------------------------------------------------------------------------

/** Gaji pokok bulanan (IDR) per role — angka fiktif untuk demo. */
export const BASE_SALARY_BY_ROLE: Record<Role, number> = {
  owner: 45_000_000,
  direktur: 35_000_000,
  manager: 18_000_000,
  supervisor: 10_000_000,
  staff: 5_500_000,
};

/** Tunjangan jabatan tetap bulanan (IDR) — di luar gaji pokok. */
export const POSITION_ALLOWANCE_BY_ROLE: Record<Role, number> = {
  owner: 0,
  direktur: 4_000_000,
  manager: 2_000_000,
  supervisor: 1_000_000,
  staff: 0,
};

/** Tunjangan harian (IDR), dihitung per hari hadir aktual (termasuk telat). */
export const DAILY_TRANSPORT_ALLOWANCE = 50_000;
export const DAILY_MEAL_ALLOWANCE = 35_000;

/** Potongan per pelanggaran. */
export const LATE_PENALTY_PER_DAY = 25_000;

/** Estimasi BPJS gabungan (Kesehatan + Ketenagakerjaan), % dari gaji pokok. */
export const BPJS_RATE = 0.04;

/**
 * Estimasi kasar PPh21 — bracket sangat disederhanakan dari gross bulanan.
 * BUKAN skema TER (Tarif Efektif Rata-rata) resmi yang berlaku sejak 2024.
 */
export function estimateIncomeTax(grossMonthly: number): number {
  if (grossMonthly <= 6_000_000) return 0;
  if (grossMonthly <= 15_000_000) return grossMonthly * 0.03;
  return grossMonthly * 0.05;
}

/** Jam kerja standar per hari, dipakai untuk hitung lembur otomatis dari absensi. */
export const STANDARD_WORK_HOURS_PER_DAY = 8;
/** Cap lembur per hari supaya data absensi yang aneh (mis. clock-out lupa) tidak menghasilkan angka absurd. */
export const MAX_OVERTIME_HOURS_PER_DAY = 4;
/** Divisor standar Indonesia untuk konversi gaji bulanan -> tarif per jam. */
export const MONTHLY_HOURS_DIVISOR = 173;
/** Multiplier lembur — disederhanakan jadi satu angka flat (bukan skema berjenjang 1.5x/2x/3x resmi). */
export const OVERTIME_MULTIPLIER = 1.5;
