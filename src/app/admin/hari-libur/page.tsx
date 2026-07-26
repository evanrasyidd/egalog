import type { Metadata } from "next";
import { getHolidays } from "@/lib/holidays";
import { PageHeader } from "@/components/card";
import { HolidayManager } from "./holiday-manager";

export const metadata: Metadata = { title: "Admin • Hari Libur" };

export default async function AdminHariLiburPage() {
  const holidays = getHolidays();
  return (
    <div>
      <PageHeader title="Kelola Hari Libur" description={`${holidays.length} hari libur — tambah atau hapus`} />
      <HolidayManager initialHolidays={holidays} />
    </div>
  );
}
