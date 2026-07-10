"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, Trash2, Loader2, TriangleAlert } from "lucide-react";
import { Avatar } from "@/components/avatar";

const TARGET_SIZE = 192;
const IMAGE_QUALITY = 0.8;

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Gagal membaca file gambar."));
    };
    img.src = url;
  });
}

function encodeCanvas(canvas: HTMLCanvasElement): string {
  // Coba WebP dulu (lebih kecil), fallback ke JPEG kalau browser diam-diam
  // tidak mendukung encoder WebP (lihat komentar sama di selfie-capture.tsx).
  const webpAttempt = canvas.toDataURL("image/webp", IMAGE_QUALITY);
  if (webpAttempt.startsWith("data:image/webp")) return webpAttempt;
  return canvas.toDataURL("image/jpeg", IMAGE_QUALITY);
}

async function fileToSquareDataUrl(file: File): Promise<string> {
  const img = await loadImage(file);
  const canvas = document.createElement("canvas");
  canvas.width = TARGET_SIZE;
  canvas.height = TARGET_SIZE;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Browser tidak mendukung pemrosesan gambar.");

  // Center-crop ke persegi dari gambar asli (berapapun aspect ratio-nya),
  // baru di-scale ke ukuran target — supaya wajah/subjek di tengah nggak
  // ikut ter-stretch kalau foto aslinya landscape/portrait.
  const cropSize = Math.min(img.naturalWidth, img.naturalHeight);
  const cropX = (img.naturalWidth - cropSize) / 2;
  const cropY = (img.naturalHeight - cropSize) / 2;

  ctx.drawImage(img, cropX, cropY, cropSize, cropSize, 0, 0, TARGET_SIZE, TARGET_SIZE);

  return encodeCanvas(canvas);
}

export function AvatarPhotoUploader({
  name,
  avatarColor,
  initialPhoto,
}: {
  name: string;
  avatarColor: string;
  initialPhoto: string | null;
}) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photo, setPhoto] = useState(initialPhoto);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // reset biar bisa pilih file yang sama lagi kalau perlu
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("File harus berupa gambar.");
      return;
    }

    setError(null);
    setIsProcessing(true);
    try {
      const dataUrl = await fileToSquareDataUrl(file);
      const res = await fetch("/api/profile/avatar-photo", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ photo: dataUrl }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message ?? "Gagal mengunggah foto.");
        return;
      }
      setPhoto(dataUrl);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setIsProcessing(false);
    }
  }

  async function handleRemove() {
    setError(null);
    setIsProcessing(true);
    try {
      const res = await fetch("/api/profile/avatar-photo", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ photo: null }),
      });
      if (!res.ok) {
        setError("Gagal menghapus foto.");
        return;
      }
      setPhoto(null);
      router.refresh();
    } catch {
      setError("Terjadi kesalahan jaringan.");
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-4">
        <Avatar name={name} avatarColor={avatarColor} avatarPhoto={photo} size="lg" />
        <div className="flex flex-col gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isProcessing}
            className="flex items-center gap-2 rounded-[10px] bg-primary text-primary-foreground px-3.5 py-2 text-sm font-medium hover:bg-primary-soft transition-colors disabled:opacity-60"
          >
            {isProcessing ? (
              <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} />
            ) : (
              <Camera className="h-4 w-4" strokeWidth={1.75} />
            )}
            {photo ? "Ganti Foto" : "Upload Foto"}
          </button>
          {photo && (
            <button
              type="button"
              onClick={handleRemove}
              disabled={isProcessing}
              className="flex items-center gap-2 rounded-[10px] border border-border bg-surface px-3.5 py-2 text-sm font-medium hover:bg-surface-muted transition-colors disabled:opacity-60"
            >
              <Trash2 className="h-4 w-4" strokeWidth={1.75} />
              Hapus Foto
            </button>
          )}
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-[10px] bg-danger/10 border border-danger/30 px-3.5 py-2.5 text-sm text-danger"
        >
          <TriangleAlert className="h-4 w-4 mt-0.5 shrink-0" strokeWidth={1.75} />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
