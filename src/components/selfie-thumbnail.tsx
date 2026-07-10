"use client";

import { useState } from "react";
import { X } from "lucide-react";

export function SelfieThumbnail({ src, alt }: { src: string; alt: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="block rounded-[6px] overflow-hidden border border-border hover:opacity-80 transition-opacity"
        aria-label={`Lihat ${alt} ukuran penuh`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt} className="h-10 w-10 object-cover" />
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={() => setIsOpen(false)}
        >
          <div className="relative max-w-sm w-full">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Tutup"
              className="absolute -top-10 right-0 h-8 w-8 flex items-center justify-center rounded-[8px] bg-white/10 text-white hover:bg-white/20 transition-colors"
            >
              <X className="h-4 w-4" strokeWidth={1.75} />
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt={alt} className="w-full rounded-[10px]" />
          </div>
        </div>
      )}
    </>
  );
}
