import { NextResponse } from "next/server";
import { z } from "zod";
import { addCandidate, findJobPostingById } from "@/lib/recruitment";
import { createRateLimiter } from "@/lib/rate-limiter";

// Endpoint ini SENGAJA publik (tanpa getCurrentActor/getCurrentEmployee) —
// ini satu-satunya cara orang di luar EgaLog bisa melamar. Karena publik,
// endpoint ini rawan disalahgunakan (spam submission, bot) — makanya wajib
// di-rate-limit per IP, beda dengan endpoint internal lain yang sudah
// terlindungi lewat session/permission.
const applyLimiter = createRateLimiter(5, 60 * 60 * 1000); // 5 lamaran/jam per IP

function getClientIp(request: Request): string {
  // Di belakang proxy (Vercel dkk), IP asli ada di header ini. Kalau nggak
  // ada (mis. run lokal langsung), fallback ke key generik — cukup untuk
  // demo, bukan defense yang sempurna terhadap spoofing IP.
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}

const bodySchema = z.object({
  name: z.string().trim().min(2).max(150),
  email: z.string().trim().email(),
  phone: z.string().trim().min(6).max(30),
  resumeNote: z.string().trim().min(10).max(2000),
  // Honeypot — field ini TIDAK ADA di form form yang manusia lihat (disembunyikan
  // via CSS di client). Bot yang mengisi semua field di DOM (atau yang hit
  // endpoint ini langsung tanpa lewat form) akan mengisi/mengirim field ini.
  website: z.string().trim().max(200).optional().default(""),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const ip = getClientIp(request);
  if (applyLimiter.isLimited(ip)) {
    return NextResponse.json(
      {
        error: "rate_limited",
        message: "Terlalu banyak lamaran dikirim dari koneksi ini. Coba lagi beberapa saat lagi.",
      },
      { status: 429 },
    );
  }

  const { id } = await params;
  const posting = findJobPostingById(id);
  if (!posting || posting.status !== "dibuka") {
    return NextResponse.json(
      { error: "not_found", message: "Lowongan tidak ditemukan atau sudah ditutup." },
      { status: 404 },
    );
  }

  const json = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    applyLimiter.recordFailure(ip);
    return NextResponse.json(
      { error: "invalid_input", message: "Data lamaran tidak lengkap atau tidak valid." },
      { status: 400 },
    );
  }

  applyLimiter.recordFailure(ip); // dihitung terlepas hasilnya, biar 1 IP nggak spam banyak lowongan sekaligus

  // Honeypot keisi -> hampir pasti bot. Pura-pura sukses (jangan kasih tau
  // alasan penolakan) supaya bot nggak "belajar" field mana yang harus
  // dikosongkan di percobaan berikutnya. Yang penting: JANGAN simpan
  // kandidat beneran.
  if (parsed.data.website !== "") {
    return NextResponse.json({ ok: true }, { status: 201 });
  }

  const result = addCandidate(
    id,
    "public", // bukan employeeId/adminId — ini submission dari luar sistem
    parsed.data.name,
    parsed.data.email,
    parsed.data.phone,
    parsed.data.resumeNote,
  );

  if (!result.ok) {
    return NextResponse.json(
      { error: "job_not_found", message: "Lowongan tidak ditemukan." },
      { status: 404 },
    );
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}
