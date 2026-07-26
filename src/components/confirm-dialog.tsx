"use client";

import { useEffect, useRef } from "react";
import { TriangleAlert, X } from "lucide-react";

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Ya, lanjutkan",
  cancelLabel = "Batal",
  variant = "danger",
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning";
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const confirmRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (open) confirmRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onCancel();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onCancel]);

  if (!open) return null;

  const variantClass =
    variant === "danger"
      ? "bg-danger text-danger-foreground hover:bg-danger/90"
      : "bg-warning text-warning-foreground hover:bg-warning/90";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50" onClick={onCancel} aria-hidden="true" />
      <div
        role="alertdialog"
        aria-modal="true"
        aria-label={title}
        className="relative w-full max-w-sm bg-surface border border-border rounded-[12px] shadow-xl p-5"
      >
        <div className="flex items-start gap-3">
          <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${variant === "danger" ? "bg-danger/10 text-danger" : "bg-warning/10 text-warning"}`}>
            <TriangleAlert className="h-4 w-4" strokeWidth={1.75} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">{title}</p>
            <p className="text-sm text-muted-foreground mt-1">{message}</p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            aria-label="Tutup"
            className="h-6 w-6 flex items-center justify-center rounded-full text-muted-foreground hover:bg-surface-muted transition-colors"
          >
            <X className="h-3.5 w-3.5" strokeWidth={2} />
          </button>
        </div>
        <div className="flex justify-end gap-2 mt-5">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-[8px] border border-border px-4 py-2 text-sm font-medium hover:bg-surface-muted transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            ref={confirmRef}
            type="button"
            onClick={onConfirm}
            className={`rounded-[8px] px-4 py-2 text-sm font-medium transition-colors ${variantClass}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
