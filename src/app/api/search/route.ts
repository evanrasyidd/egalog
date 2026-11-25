import { NextResponse } from "next/server";
import { getCurrentEmployee } from "@/lib/current-employee";
import { globalSearch } from "@/lib/search";
import { createRateLimiter } from "@/lib/rate-limiter";

const searchLimiter = createRateLimiter(30, 60); // 30 requests per menit per IP

export async function GET(request: Request) {
  const employee = await getCurrentEmployee();
  if (!employee) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const ip = request.headers.get("x-forwarded-for") ?? "unknown";
  if (searchLimiter.isLimited(ip)) {
    return NextResponse.json({ error: "too_many_requests", message: "Terlalu banyak permintaan. Coba lagi nanti." }, { status: 429 });
  }
  searchLimiter.recordFailure(ip);
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") ?? "";
  const results = globalSearch(q, employee);
  return NextResponse.json({ results });
}
