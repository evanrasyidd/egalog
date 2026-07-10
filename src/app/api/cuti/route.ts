import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentEmployee } from "@/lib/current-employee";
import { createLeaveRequest } from "@/lib/leave";
import { leaveRequests } from "@/lib/db";

const bodySchema = z
  .object({
    type: z.enum(["cuti_tahunan", "sakit", "izin"]),
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    reason: z.string().trim().min(5).max(500),
  })
  .strict();

export async function GET() {
  const employee = await getCurrentEmployee();
  if (!employee) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const requests = leaveRequests
    .filter((r) => r.employeeId === employee.id)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return NextResponse.json({ requests });
}

export async function POST(request: Request) {
  const employee = await getCurrentEmployee();
  if (!employee) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const json = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid_input", message: "Data pengajuan tidak lengkap atau tidak valid." },
      { status: 400 },
    );
  }

  const { type, startDate, endDate, reason } = parsed.data;
  const result = createLeaveRequest(employee.id, type, startDate, endDate, reason);

  if (!result.ok) {
    const messages: Record<string, string> = {
      insufficient_balance: "Saldo cuti tahunan kamu tidak cukup untuk rentang tanggal ini.",
      invalid_date_range: "Tanggal selesai tidak boleh sebelum tanggal mulai.",
      employee_not_found: "Data karyawan tidak ditemukan.",
    };
    return NextResponse.json(
      { error: result.error, message: messages[result.error] },
      { status: 422 },
    );
  }

  return NextResponse.json({ ok: true, request: result.request }, { status: 201 });
}
