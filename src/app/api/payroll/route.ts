import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentActor, actorHasPermission, actorId } from "@/lib/current-actor";
import { canManagePayroll } from "@/lib/permissions";
import {
  generatePayslip,
  generatePayslipsForAll,
  getPayslipsForEmployee,
  getPayslipsForPeriod,
  isValidPeriod,
} from "@/lib/payroll";
import { employees, findEmployeeById } from "@/lib/db";

export async function GET(request: Request) {
  const actor = await getCurrentActor();
  if (!actor) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const employeeId = url.searchParams.get("employeeId");
  const period = url.searchParams.get("period");
  const isManager = actorHasPermission(actor, canManagePayroll);
  // Admin bukan karyawan — jadi "punya payslip sendiri" tidak berlaku,
  // setiap employeeId yang diminta dianggap "punya orang lain".
  const selfId = actor.type === "employee" ? actor.employee.id : null;

  // Manager payroll minta rekap 1 periode untuk seluruh karyawan.
  if (period && !employeeId) {
    if (!isManager) {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }
    if (!isValidPeriod(period)) {
      return NextResponse.json({ error: "invalid_period" }, { status: 400 });
    }
    const periodPayslips = getPayslipsForPeriod(period);
    return NextResponse.json({ payslips: periodPayslips });
  }

  // Lihat payslip karyawan lain -> harus manager payroll (atau Admin).
  if (employeeId && employeeId !== selfId) {
    if (!isManager) {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }
    if (!findEmployeeById(employeeId)) {
      return NextResponse.json({ error: "employee_not_found" }, { status: 404 });
    }
    return NextResponse.json({ payslips: getPayslipsForEmployee(employeeId) });
  }

  // Default: payslip milik sendiri. Admin tidak punya "milik sendiri" —
  // endpoint ini memang bukan untuk Admin tanpa employeeId eksplisit.
  if (!selfId) {
    return NextResponse.json({ error: "employee_id_required" }, { status: 400 });
  }
  return NextResponse.json({ payslips: getPayslipsForEmployee(selfId) });
}

const generateSchema = z.discriminatedUnion("mode", [
  z.object({ mode: z.literal("single"), employeeId: z.string().min(1), period: z.string() }),
  z.object({ mode: z.literal("all"), period: z.string() }),
]);

export async function POST(request: Request) {
  const actor = await getCurrentActor();
  if (!actor) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (!actorHasPermission(actor, canManagePayroll)) {
    return NextResponse.json(
      { error: "forbidden", message: "Kamu tidak punya akses untuk generate payroll." },
      { status: 403 },
    );
  }

  const json = await request.json().catch(() => null);
  const parsed = generateSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid_input", message: "Data tidak valid." },
      { status: 400 },
    );
  }

  if (!isValidPeriod(parsed.data.period)) {
    return NextResponse.json(
      { error: "invalid_period", message: "Format periode harus YYYY-MM." },
      { status: 400 },
    );
  }

  const generatedBy = actorId(actor);

  if (parsed.data.mode === "all") {
    const summary = generatePayslipsForAll(employees, parsed.data.period, generatedBy);
    return NextResponse.json({ ok: true, summary });
  }

  const result = generatePayslip(parsed.data.employeeId, parsed.data.period, generatedBy);
  if (!result.ok) {
    const messages: Record<string, string> = {
      already_exists: "Slip gaji untuk karyawan & periode ini sudah pernah dibuat.",
      employee_not_found: "Karyawan tidak ditemukan.",
      invalid_period: "Format periode harus YYYY-MM.",
    };
    return NextResponse.json(
      { error: result.error, message: messages[result.error] },
      { status: 422 },
    );
  }

  return NextResponse.json({ ok: true, payslip: result.payslip }, { status: 201 });
}
