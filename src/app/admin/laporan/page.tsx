import type { Metadata } from "next";
import { Card, PageHeader } from "@/components/card";
import { ReportTabs } from "@/components/report-tabs";

export const metadata: Metadata = { title: "Admin • Laporan" };

export default function AdminLaporanPage() {
  return (
    <div>
      <PageHeader title="Laporan & Ekspor" description="Preview data, filter tanggal dari kalender, lalu download CSV" />
      <Card>
        <ReportTabs />
      </Card>
    </div>
  );
}
