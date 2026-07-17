import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentEmployee } from "@/lib/current-employee";
import { canManagePerformanceFor } from "@/lib/permissions";
import {
  saveDraftReview,
  getFinalReviewsForEmployee,
  getAllReviewsForEmployee,
  isValidCycle,
} from "@/lib/performance";
import { findEmployeeById } from "@/lib/db";
import { COMPETENCIES } from "@/lib/types";

export async function GET(request: Request) {
  const employee = await getCurrentEmployee();
  if (!employee) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const employeeId = url.searchParams.get("employeeId");

  if (employeeId && employeeId !== employee.id) {
    if (!canManagePerformanceFor(employee.id, employeeId)) {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }
    if (!findEmployeeById(employeeId)) {
      return NextResponse.json({ error: "employee_not_found" }, { status: 404 });
    }
    // Manager boleh lihat draft + final review dari direct report-nya.
    return NextResponse.json({ reviews: getAllReviewsForEmployee(employeeId) });
  }

  // Karyawan cuma boleh lihat review milik sendiri yang sudah final.
  return NextResponse.json({ reviews: getFinalReviewsForEmployee(employee.id) });
}

const scoreSchema = z.number().int().min(1).max(5);

const bodySchema = z.object({
  employeeId: z.string().min(1),
  cycle: z.string(),
  scores: z.object(
    Object.fromEntries(COMPETENCIES.map((c) => [c, scoreSchema])) as Record<
      (typeof COMPETENCIES)[number],
      typeof scoreSchema
    >,
  ),
  strengths: z.string().trim().min(3).max(1000),
  areasForImprovement: z.string().trim().min(3).max(1000),
});

export async function POST(request: Request) {
  const employee = await getCurrentEmployee();
  if (!employee) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const json = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid_input", message: "Data review tidak lengkap atau tidak valid." },
      { status: 400 },
    );
  }

  if (!isValidCycle(parsed.data.cycle)) {
    return NextResponse.json(
      { error: "invalid_cycle", message: "Format siklus harus YYYY-Q1 s.d. YYYY-Q4." },
      { status: 400 },
    );
  }

  const result = saveDraftReview(
    employee.id,
    parsed.data.employeeId,
    parsed.data.cycle,
    parsed.data.scores,
    parsed.data.strengths,
    parsed.data.areasForImprovement,
  );

  if (!result.ok) {
    const messages: Record<string, string> = {
      invalid_cycle: "Format siklus tidak valid.",
      not_direct_manager: "Kamu bukan atasan langsung karyawan ini.",
      employee_not_found: "Karyawan tidak ditemukan.",
      already_final: "Review ini sudah final dan tidak bisa diedit lagi.",
    };
    const statusMap: Record<string, number> = {
      invalid_cycle: 400,
      not_direct_manager: 403,
      employee_not_found: 404,
      already_final: 409,
    };
    return NextResponse.json(
      { error: result.error, message: messages[result.error] },
      { status: statusMap[result.error] },
    );
  }

  return NextResponse.json({ ok: true, review: result.review }, { status: 201 });
}
