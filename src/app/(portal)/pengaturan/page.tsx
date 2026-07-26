import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentEmployee } from "@/lib/current-employee";

export const metadata: Metadata = { title: "Pengaturan" };
import { getSystemSettings } from "@/lib/settings";
import { ROLE_LEVEL } from "@/lib/types";
import { Card, PageHeader } from "@/components/card";
import { SettingsForm } from "./settings-form";

export default async function PengaturanPage() {
  const employee = await getCurrentEmployee();
  if (!employee) redirect("/login");

  if (employee.role !== "owner") redirect("/dashboard");

  const settings = getSystemSettings();

  return (
    <div>
      <PageHeader title="Pengaturan Sistem" description="Konfigurasi jam kerja, geofence, & komponen payroll" />

      <Card>
        <SettingsForm initialSettings={settings} />
      </Card>
    </div>
  );
}
