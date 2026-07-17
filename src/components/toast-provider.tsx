"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";
import { CheckCircle2, TriangleAlert, Info, X } from "lucide-react";

type ToastVariant = "success" | "error" | "info";
type Toast = { id: number; message: string; variant: ToastVariant };

const VARIANT_STYLE: Record<ToastVariant, { icon: typeof CheckCircle2; className: string }> = {
  success: { icon: CheckCircle2, className: "bg-success text-success-foreground" },
  error: { icon: TriangleAlert, className: "bg-danger text-danger-foreground" },
  info: { icon: Info, className: "bg-primary text-primary-foreground" },
};

const ToastContext = createContext<((message: string, variant?: ToastVariant) => void) | null>(
  null,
);

/** Panggil ini buat nampilin toast — ganti window.alert()/tanpa-feedback-diem. */
export function useToast() {
  const showToast = useContext(ToastContext);
  if (!showToast) throw new Error("useToast harus dipakai di dalam ToastProvider");
  return showToast;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(0);

  const showToast = useCallback((message: string, variant: ToastVariant = "success") => {
    const id = nextId.current++;
    setToasts((prev) => [...prev, { id, message, variant }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      <div
        className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 w-[calc(100%-2rem)] sm:w-auto sm:max-w-sm"
        aria-live="polite"
        aria-atomic="true"
      >
        {toasts.map((t) => {
          const { icon: Icon, className } = VARIANT_STYLE[t.variant];
          return (
            <div
              key={t.id}
              role="status"
              className={`flex items-start gap-2.5 rounded-[10px] px-3.5 py-3 text-sm font-medium shadow-lg animate-toast-in ${className}`}
            >
              <Icon className="h-4 w-4 mt-0.5 shrink-0" strokeWidth={1.75} />
              <span className="flex-1">{t.message}</span>
              <button
                type="button"
                onClick={() => setToasts((prev) => prev.filter((x) => x.id !== t.id))}
                aria-label="Tutup notifikasi"
                className="shrink-0 opacity-80 hover:opacity-100 transition-opacity"
              >
                <X className="h-3.5 w-3.5" strokeWidth={2} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
