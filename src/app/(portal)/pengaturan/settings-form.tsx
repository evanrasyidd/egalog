"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save, Loader2 } from "lucide-react";
import { useToast } from "@/components/toast-provider";
import type { SystemSettings } from "@/lib/types";

export function SettingsForm({ initialSettings, apiUrl = "/api/settings" }: { initialSettings: SystemSettings; apiUrl?: string }) {
  const router = useRouter();
  const showToast = useToast();
  const [settings, setSettings] = useState(initialSettings);
  const [loading, setLoading] = useState(false);

  function update<K extends keyof SystemSettings>(key: K, value: SystemSettings[K]) {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(apiUrl, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (!res.ok) {
        showToast("Gagal menyimpan pengaturan.", "error");
        return;
      }
      showToast("Pengaturan berhasil disimpan.");
      router.refresh();
    } catch {
      showToast("Gagal menyimpan.", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSave} className="space-y-8">
      <fieldset>
        <legend className="text-sm font-medium mb-4 text-foreground/80">Jam Kerja</legend>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="workStartHour" className="text-sm font-medium mb-1 block">Jam Mulai Kerja</label>
            <input id="workStartHour" type="number" min={0} max={23} value={settings.workStartHour} onChange={(e) => update("workStartHour", Number(e.target.value))} className="w-full rounded-[8px] border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
          </div>
          <div>
            <label htmlFor="workStartMinute" className="text-sm font-medium mb-1 block">Menit Mulai Kerja</label>
            <input id="workStartMinute" type="number" min={0} max={59} value={settings.workStartMinute} onChange={(e) => update("workStartMinute", Number(e.target.value))} className="w-full rounded-[8px] border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
          </div>
        </div>
      </fieldset>

      <fieldset>
        <legend className="text-sm font-medium mb-4 text-foreground/80">Geofence Kantor</legend>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="officeLat" className="text-sm font-medium mb-1 block">Latitude</label>
            <input id="officeLat" type="number" step="any" value={settings.officeLat} onChange={(e) => update("officeLat", Number(e.target.value))} className="w-full rounded-[8px] border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
          </div>
          <div>
            <label htmlFor="officeLng" className="text-sm font-medium mb-1 block">Longitude</label>
            <input id="officeLng" type="number" step="any" value={settings.officeLng} onChange={(e) => update("officeLng", Number(e.target.value))} className="w-full rounded-[8px] border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="officeLabel" className="text-sm font-medium mb-1 block">Label Kantor</label>
            <input id="officeLabel" type="text" value={settings.officeLabel} onChange={(e) => update("officeLabel", e.target.value)} className="w-full rounded-[8px] border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
          </div>
          <div>
            <label htmlFor="geofenceRadius" className="text-sm font-medium mb-1 block">Radius (meter)</label>
            <input id="geofenceRadius" type="number" min={10} max={10000} value={settings.geofenceRadiusMeters} onChange={(e) => update("geofenceRadiusMeters", Number(e.target.value))} className="w-full rounded-[8px] border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
          </div>
        </div>
      </fieldset>

      <fieldset>
        <legend className="text-sm font-medium mb-4 text-foreground/80">Komponen Payroll</legend>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="transportAllowance" className="text-sm font-medium mb-1 block">Tunjangan Transport (Rp/hari)</label>
            <input id="transportAllowance" type="number" min={0} value={settings.dailyTransportAllowance} onChange={(e) => update("dailyTransportAllowance", Number(e.target.value))} className="w-full rounded-[8px] border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
          </div>
          <div>
            <label htmlFor="mealAllowance" className="text-sm font-medium mb-1 block">Tunjangan Makan (Rp/hari)</label>
            <input id="mealAllowance" type="number" min={0} value={settings.dailyMealAllowance} onChange={(e) => update("dailyMealAllowance", Number(e.target.value))} className="w-full rounded-[8px] border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
          </div>
          <div>
            <label htmlFor="latePenalty" className="text-sm font-medium mb-1 block">Denda Keterlambatan (Rp/hari)</label>
            <input id="latePenalty" type="number" min={0} value={settings.latePenaltyPerDay} onChange={(e) => update("latePenaltyPerDay", Number(e.target.value))} className="w-full rounded-[8px] border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
          </div>
          <div>
            <label htmlFor="bpjsRate" className="text-sm font-medium mb-1 block">Rate BPJS (% dari gaji)</label>
            <input id="bpjsRate" type="number" step="0.01" min={0} max={1} value={settings.bpjsRate} onChange={(e) => update("bpjsRate", Number(e.target.value))} className="w-full rounded-[8px] border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
          </div>
        </div>
      </fieldset>

      <button type="submit" disabled={loading} className="flex items-center justify-center gap-2 rounded-[10px] bg-primary text-primary-foreground py-2.5 px-6 text-sm font-medium hover:bg-primary-soft transition-colors disabled:opacity-50">
        {loading ? <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} /> : <Save className="h-4 w-4" strokeWidth={1.75} />}
        Simpan Pengaturan
      </button>
    </form>
  );
}
