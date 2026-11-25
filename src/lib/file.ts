import "server-only";

/**
 * Validasi CV yang dikirim sebagai data URL. Client hanya boleh mengirim
 * PDF/DOC/DOCX; server tetap memeriksa MIME + magic bytes karena validasi
 * client bisa dilewati dengan hit endpoint langsung.
 */
const ALLOWED_MIME = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

const MAX_BYTES = 2 * 1024 * 1024;

export type ResumeData = {
  mime: string;
  base64: string;
  extension: "pdf" | "doc" | "docx";
};

export type ResumeParseResult =
  | { ok: true; data: ResumeData }
  | { ok: false; error: "format" | "too_large" | "mismatch" };

function startsWith(buffer: Buffer, signature: number[]): boolean {
  if (buffer.length < signature.length) return false;
  return signature.every((byte, index) => buffer[index] === byte);
}

export function parseResumeDataUrl(value: string): ResumeParseResult {
  const match = /^data:([^;,]+);base64,([A-Za-z0-9+/=\s]+)$/.exec(value);
  if (!match) return { ok: false, error: "format" };

  const mime = match[1].toLowerCase();
  if (!ALLOWED_MIME.has(mime)) return { ok: false, error: "format" };

  const base64 = match[2].replace(/\s/g, "");
  const bytes = Buffer.from(base64, "base64");
  if (bytes.length === 0) return { ok: false, error: "format" };
  if (bytes.length > MAX_BYTES) return { ok: false, error: "too_large" };

  const isPdf = startsWith(bytes, [0x25, 0x50, 0x44, 0x46]); // %PDF
  const isOle = startsWith(bytes, [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]);
  const isZip = startsWith(bytes, [0x50, 0x4b, 0x03, 0x04]); // PK..

  if (mime === "application/pdf" && !isPdf) return { ok: false, error: "mismatch" };
  if (mime === "application/msword" && !isOle) return { ok: false, error: "mismatch" };
  if (mime.includes("wordprocessingml") && !isZip) return { ok: false, error: "mismatch" };

  const extension = isPdf ? "pdf" : isOle ? "doc" : "docx";
  return { ok: true, data: { mime, base64, extension } };
}
