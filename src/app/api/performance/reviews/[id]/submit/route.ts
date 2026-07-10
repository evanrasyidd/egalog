import { NextResponse } from "next/server";
import { getCurrentEmployee } from "@/lib/current-employee";
import { submitReview } from "@/lib/performance";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const employee = await getCurrentEmployee();
  if (!employee) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const result = submitReview(id, employee.id);

  if (!result.ok) {
    const messages: Record<string, string> = {
      not_found: "Review tidak ditemukan.",
      not_reviewer: "Kamu bukan reviewer untuk review ini.",
      already_final: "Review ini sudah final sebelumnya.",
    };
    const statusMap: Record<string, number> = {
      not_found: 404,
      not_reviewer: 403,
      already_final: 409,
    };
    return NextResponse.json(
      { error: result.error, message: messages[result.error] },
      { status: statusMap[result.error] },
    );
  }

  return NextResponse.json({ ok: true, review: result.review });
}
