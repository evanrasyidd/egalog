"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, RotateCcw, Check, X, Loader2, TriangleAlert } from "lucide-react";

const CAPTURE_WIDTH = 480;
const CAPTURE_HEIGHT = 360;
const IMAGE_QUALITY = 0.75; // WebP di kualitas ini setara JPEG ~0.85 tapi lebih kecil

interface SelfieCaptureProps {
  title: string;
  onConfirm: (dataUrl: string) => void;
  onCancel: () => void;
}

export function SelfieCapture({ title, onConfirm, onCancel }: SelfieCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [isStarting, setIsStarting] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function startCamera() {
      setError(null);
      setIsStarting(true);
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user", width: { ideal: CAPTURE_WIDTH }, height: { ideal: CAPTURE_HEIGHT } },
          audio: false,
        });
        if (!mounted) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
      } catch {
        if (mounted) {
          setError(
            "Tidak bisa mengakses kamera. Pastikan kamu memberi izin akses kamera di browser.",
          );
        }
      } finally {
        if (mounted) setIsStarting(false);
      }
    }

    startCamera();

    return () => {
      mounted = false;
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  function stopCamera() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }

  function encodeCanvas(canvas: HTMLCanvasElement): string {
    // Coba WebP dulu (lebih kecil ~25-35% dari JPEG di kualitas setara).
    // Browser lama (Firefox <98, Safari <14) diam-diam fallback ke PNG kalau
    // encoder WebP nggak ada — makanya kita deteksi manual dan baru pakai
    // JPEG kalau itu terjadi, daripada ngirim PNG (jauh lebih besar).
    const webpAttempt = canvas.toDataURL("image/webp", IMAGE_QUALITY);
    if (webpAttempt.startsWith("data:image/webp")) {
      return webpAttempt;
    }
    return canvas.toDataURL("image/jpeg", IMAGE_QUALITY);
  }

  function handleCapture() {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    canvas.width = CAPTURE_WIDTH;
    canvas.height = CAPTURE_HEIGHT;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Cermin horizontal supaya hasil foto sesuai apa yang dilihat user di preview (efek selfie).
    ctx.translate(CAPTURE_WIDTH, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, CAPTURE_WIDTH, CAPTURE_HEIGHT);

    const dataUrl = encodeCanvas(canvas);
    setCapturedPhoto(dataUrl);
    stopCamera();
  }

  function handleRetake() {
    setCapturedPhoto(null);
    setIsStarting(true);
    setError(null);
    navigator.mediaDevices
      .getUserMedia({
        video: { facingMode: "user", width: { ideal: CAPTURE_WIDTH }, height: { ideal: CAPTURE_HEIGHT } },
        audio: false,
      })
      .then((stream) => {
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
        setIsStarting(false);
      })
      .catch(() => {
        setError("Tidak bisa mengakses kamera. Pastikan kamu memberi izin akses kamera di browser.");
        setIsStarting(false);
      });
  }

  function handleCancel() {
    stopCamera();
    onCancel();
  }

  function handleConfirm() {
    if (capturedPhoto) onConfirm(capturedPhoto);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-sm rounded-[10px] bg-surface border border-border overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <p className="text-sm font-medium">{title}</p>
          <button
            type="button"
            onClick={handleCancel}
            aria-label="Batal"
            className="h-7 w-7 flex items-center justify-center rounded-[6px] text-muted-foreground hover:bg-surface-muted transition-colors"
          >
            <X className="h-4 w-4" strokeWidth={1.75} />
          </button>
        </div>

        <div className="relative aspect-[4/3] bg-black">
          {error ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-6 text-center">
              <TriangleAlert className="h-6 w-6 text-warning" strokeWidth={1.75} />
              <p className="text-sm text-white">{error}</p>
            </div>
          ) : capturedPhoto ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={capturedPhoto} alt="Hasil selfie" className="h-full w-full object-cover" />
          ) : (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="h-full w-full object-cover [transform:scaleX(-1)]"
              />
              {isStarting && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                  <Loader2 className="h-6 w-6 text-white animate-spin" strokeWidth={2} />
                </div>
              )}
            </>
          )}
          <canvas ref={canvasRef} className="hidden" />
        </div>

        <div className="flex gap-2 p-4">
          {error ? (
            <button
              type="button"
              onClick={handleRetake}
              className="flex-1 flex items-center justify-center gap-2 rounded-[10px] bg-primary text-primary-foreground py-2.5 text-sm font-medium hover:bg-primary-soft transition-colors"
            >
              <RotateCcw className="h-4 w-4" strokeWidth={1.75} />
              Coba Lagi
            </button>
          ) : capturedPhoto ? (
            <>
              <button
                type="button"
                onClick={handleRetake}
                className="flex-1 flex items-center justify-center gap-2 rounded-[10px] border border-border bg-surface py-2.5 text-sm font-medium hover:bg-surface-muted transition-colors"
              >
                <RotateCcw className="h-4 w-4" strokeWidth={1.75} />
                Ambil Ulang
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                className="flex-1 flex items-center justify-center gap-2 rounded-[10px] bg-primary text-primary-foreground py-2.5 text-sm font-medium hover:bg-primary-soft transition-colors"
              >
                <Check className="h-4 w-4" strokeWidth={1.75} />
                Gunakan Foto
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={handleCapture}
              disabled={isStarting}
              className="flex-1 flex items-center justify-center gap-2 rounded-[10px] bg-primary text-primary-foreground py-2.5 text-sm font-medium hover:bg-primary-soft transition-colors disabled:opacity-60"
            >
              <Camera className="h-4 w-4" strokeWidth={1.75} />
              Ambil Foto
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
