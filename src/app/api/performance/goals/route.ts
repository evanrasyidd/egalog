import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentEmployee } from "@/lib/current-employee";
import { isDirectManagerOf } from "@/lib/permissions";
import { createGoal, getGoalsForEmployee, isValidCycle } from "@/lib/performance";
import { findEmployeeById } from "@/lib/db";

export async function GET(request: Request) {
  const employee = await getCurrentEmployee();
  if (!employee) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const employeeId = url.searchParams.get("employeeId") ?? employee.id;

  if (employeeId !== employee.id && !isDirectManagerOf(employee.id, employeeId)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  if (!findEmployeeById(employeeId)) {
    return NextResponse.json({ error: "employee_not_found" }, { status: 404 });
  }

  return NextResponse.json({ goals: getGoalsForEmployee(employeeId) });
}

const bodySchema = z.object({
  employeeId: z.string().min(1),
  cycle: z.string(),
  title: z.string().trim().min(3).max(200),
  description: z.string().trim().max(1000).default(""),
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
      { error: "invalid_input", message: "Data goal tidak valid." },
      { status: 400 },
    );
  }

  if (!isValidCycle(parsed.data.cycle)) {
    return NextResponse.json(
      { error: "invalid_cycle", message: "Format siklus harus YYYY-Q1 s.d. YYYY-Q4." },
      { status: 400 },
    );
  }

  const result = createGoal(
    employee.id,
    parsed.data.employeeId,
    parsed.data.cycle,
    parsed.data.title,
    parsed.data.description,
  );

  if (!result.ok) {
    const messages: Record<string, string> = {
      not_direct_manager: "Kamu bukan atasan langsung karyawan ini.",
      employee_not_found: "Karyawan tidak ditemukan.",
    };
    const statusMap: Record<string, number> = { not_direct_manager: 403, employee_not_found: 404 };
    return NextResponse.json(
      { error: result.error, message: messages[result.error] },
      { status: statusMap[result.error] },
    );
  }

  return NextResponse.json({ ok: true, goal: result.goal }, { status: 201 });
}
