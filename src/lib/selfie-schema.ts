import { z } from "zod";

// Selfie dikirim sebagai data URL base64 (JPEG) dari kamera browser, sudah
// di-downscale & dikompres di sisi client sebelum dikirim (lihat
// components/selfie-capture.tsx) supaya ukurannya kecil. Batas panjang string
// di bawah ini (~1.5MB terdecode) adalah pengaman terhadap payload abuse,
// bukan ukuran yang diharapkan normal (foto terkompresi biasanya <100KB).
const MAX_SELFIE_DATA_URL_LENGTH = 2_000_000;

export const selfieSchema = z
  .string()
  .min(1, "Selfie wajib diambil.")
  .max(MAX_SELFIE_DATA_URL_LENGTH, "Ukuran foto terlalu besar.")
  .regex(/^data:image\/(jpeg|jpg|png|webp);base64,/, "Format foto tidak valid.");
