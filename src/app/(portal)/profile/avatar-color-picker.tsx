"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2 } from "lucide-react";

const AVATAR_COLOR_PRESETS = [
  "#1E2A44",
  "#2D4159",
  "#3D5A80",
  "#6B8CAE",
  "#B08968",
  "#C96A2E",
  "#2F7D4F",
  "#6B4E71",
] as const;

export function AvatarColorPicker({ currentColor }: { currentColor: string }) {
  const router = useRouter();
  const [selected, setSelected] = useState(currentColor);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSelect(color: string) {
    if (color === selected) return;
    setSelected(color);
    setIsLoading(true);
    try {
      await fetch("/api/profile/avatar", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ color }),
      });
      router.refresh();
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      {AVATAR_COLOR_PRESETS.map((color) => (
        <button
          key={color}
          type="button"
          onClick={() => handleSelect(color)}
          disabled={isLoading}
          aria-label={`Pilih warna ${color}`}
          className="h-8 w-8 rounded-full flex items-center justify-center transition-transform disabled:opacity-60"
          style={{ backgroundColor: color }}
        >
          {selected === color &&
            (isLoading ? (
              <Loader2 className="h-3.5 w-3.5 text-white animate-spin" strokeWidth={2.5} />
            ) : (
              <Check className="h-3.5 w-3.5 text-white" strokeWidth={2.5} />
            ))}
        </button>
      ))}
    </div>
  );
}
