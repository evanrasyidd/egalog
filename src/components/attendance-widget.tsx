"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogIn, LogOut, Loader2, MapPin, TriangleAlert } from "lucide-react";
import { useToast } from "@/components/toast-provider";
import { StatusBadge } from "./status-badge";
import { SelfieCapture } from "./selfie-capture";
import type { AttendanceRecord } from "@/lib/types";

function formatTime(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Jakarta",
  });
}

function getBrowserLocation(): Promise<{ lat: number; lng: number }> {
  return new Promise((resolve, reject) => {
    if (!("geolocation" in navigator)) {
      reject(new Error("Browser kamu tidak mendukung geolocation."));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          reject(new Error("Izin lokasi ditolak. Aktifkan akses lokasi untuk absen."));
        } else {
          reject(new Error("Gagal mengambil lokasi kamu. Coba lagi."));
        }
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  });
}

export function AttendanceWidget({
  initialRecord,
  officeLabel,
}: {
  initialRecord: AttendanceRecord | null;
  officeLabel: string;
}) {
  const router = useRouter();
  const showToast = useToast();
  const [record, setRecord] = useState(initialRecord);
  const [isLoading, setIsLoading] = useState<"in" | "out" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [captureMode, setCaptureMode] = useState<"in" | "out" | null>(null);

  async function submitWithSelfie(action: "in" | "out", selfie: string) {
    setError(null);
    setIsLoading(action);
    try {
      const location = await getBrowserLocation();
      const res = await fetch(`/api/absensi/clock-${action}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...location, selfie }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.message ?? "Gagal memproses absensi.");
        showToast(data.message ?? "Gagal memproses absensi.", "error");
        setIsLoading(null);
        return;
      }

      setRecord(data.record);
      showToast(action === "in" ? "Absen masuk berhasil dicatat." : "Absen pulang berhasil dicatat.");
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Terjadi kesalahan.";
      setError(message);
      showToast(message, "error");
    } finally {
      setIsLoading(null);
    }
  }

  const hasClockIn = !!record?.clockIn;
  const hasClockOut = !!record?.clockOut;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <MapPin className="h-3.5 w-3.5" strokeWidth={1.75} />
          <span>Radius wajib: {officeLabel}</span>
        </div>
        {record && <StatusBadge status={record.status} />}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs text-muted-foreground mb-1">Jam Masuk</p>
          <p className="text-2xl font-semibold font-mono tabular-nums">
            {formatTime(record?.clockIn ?? null)}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-1">Jam Pulang</p>
          <p className="text-2xl font-semibold font-mono tabular-nums">
            {formatTime(record?.clockOut ?? null)}
          </p>
        </div>
      </div>

      {(record?.selfieClockIn || record?.selfieClockOut) && (
        <div className="flex gap-3">
          {record.selfieClockIn && (
            <div>
              <p className="text-xs text-muted-foreground mb-1">Foto Masuk</p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={record.selfieClockIn}
                alt="Selfie absen masuk"
                className="h-16 w-16 rounded-[8px] object-cover border border-border"
              />
            </div>
          )}
          {record.selfieClockOut && (
            <div>
              <p className="text-xs text-muted-foreground mb-1">Foto Pulang</p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={record.selfieClockOut}
                alt="Selfie absen pulang"
                className="h-16 w-16 rounded-[8px] object-cover border border-border"
              />
            </div>
          )}
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-[10px] bg-danger/10 border border-danger/30 px-3.5 py-2.5 text-sm text-danger"
        >
          <TriangleAlert className="h-4 w-4 mt-0.5 shrink-0" strokeWidth={1.75} />
          <span>{error}</span>
        </div>
      )}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => setCaptureMode("in")}
          disabled={hasClockIn || isLoading !== null}
          className="flex-1 flex items-center justify-center gap-2 rounded-[10px] bg-primary text-primary-foreground py-2.5 text-sm font-medium hover:bg-primary-soft transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading === "in" ? (
            <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} />
          ) : (
            <LogIn className="h-4 w-4" strokeWidth={1.75} />
          )}
          Absen Masuk
        </button>
        <button
          type="button"
          onClick={() => setCaptureMode("out")}
          disabled={!hasClockIn || hasClockOut || isLoading !== null}
          className="flex-1 flex items-center justify-center gap-2 rounded-[10px] border border-border bg-surface py-2.5 text-sm font-medium hover:bg-surface-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading === "out" ? (
            <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} />
          ) : (
            <LogOut className="h-4 w-4" strokeWidth={1.75} />
          )}
          Absen Pulang
        </button>
      </div>

      {captureMode && (
        <SelfieCapture
          title={captureMode === "in" ? "Selfie Absen Masuk" : "Selfie Absen Pulang"}
          onCancel={() => setCaptureMode(null)}
          onConfirm={(dataUrl) => {
            const action = captureMode;
            setCaptureMode(null);
            submitWithSelfie(action, dataUrl);
          }}
        />
      )}
    </div>
  );
}
