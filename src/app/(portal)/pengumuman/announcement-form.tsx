"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Send, Loader2 } from "lucide-react";
import { useToast } from "@/components/toast-provider";

export function AnnouncementForm() {
  const router = useRouter();
  const showToast = useToast();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [priority, setPriority] = useState<"normal" | "penting">("normal");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setError("Judul dan isi harus diisi.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim(), content: content.trim(), priority }),
      });
      if (!res.ok) {
        const d = await res.json();
        setError(d.message ?? "Gagal membuat pengumuman.");
        showToast(d.message ?? "Gagal membuat pengumuman.", "error");
        return;
      }
      showToast("Pengumuman berhasil dibuat & dikirim ke semua karyawan.");
      setTitle("");
      setContent("");
      setPriority("normal");
      router.refresh();
    } catch {
      setError("Terjadi kesalahan.");
      showToast("Gagal membuat pengumuman.", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="ann-title" className="text-sm font-medium mb-1 block">
          Judul
        </label>
        <input
          id="ann-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full rounded-[8px] border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          placeholder="Judul pengumuman"
        />
      </div>
      <div>
        <label htmlFor="ann-content" className="text-sm font-medium mb-1 block">
          Isi
        </label>
        <textarea
          id="ann-content"
          rows={4}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full rounded-[8px] border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
          placeholder="Tulis pengumuman..."
        />
      </div>
      <div>
        <label htmlFor="ann-priority" className="text-sm font-medium mb-1 block">
          Prioritas
        </label>
        <select
          id="ann-priority"
          value={priority}
          onChange={(e) => setPriority(e.target.value as "normal" | "penting")}
          className="w-full rounded-[8px] border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          <option value="normal">Normal</option>
          <option value="penting">Penting</option>
        </select>
      </div>

      {error && (
        <div className="rounded-[8px] bg-danger/10 border border-danger/30 px-3 py-2 text-sm text-danger">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 rounded-[10px] bg-primary text-primary-foreground py-2.5 text-sm font-medium hover:bg-primary-soft transition-colors disabled:opacity-50"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} />
        ) : (
          <Send className="h-4 w-4" strokeWidth={1.75} />
        )}
        Kirim Pengumuman
      </button>
    </form>
  );
}
