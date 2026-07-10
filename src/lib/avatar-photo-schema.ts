import { z } from "zod";

// Foto profil dirender di HAMPIR SEMUA halaman (topbar, direktori karyawan,
// org chart) — beda dengan selfie absensi yang cuma muncul di 1-2 halaman.
// Makanya limit ukurannya jauh lebih ketat di sini. Foto sudah di-downscale
// ke persegi kecil (192x192) & dikompresi di client sebelum dikirim (lihat
// components/avatar-photo-uploader.tsx), jadi angka di bawah adalah pengaman
// terhadap payload abuse, bukan ukuran normal yang diharapkan (biasanya <30KB).
const MAX_AVATAR_PHOTO_DATA_URL_LENGTH = 500_000;

export const avatarPhotoSchema = z
  .string()
  .min(1)
  .max(MAX_AVATAR_PHOTO_DATA_URL_LENGTH, "Ukuran foto terlalu besar.")
  .regex(/^data:image\/(jpeg|jpg|png|webp);base64,/, "Format foto tidak valid.");
