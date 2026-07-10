import "server-only";
import { getSession } from "./session";
import { findEmployeeById } from "./db";
import type { Employee } from "./types";

export async function getCurrentEmployee(): Promise<Employee | null> {
  const session = await getSession();
  if (!session) return null;

  const employee = findEmployeeById(session.sub);
  if (!employee) return null;

  // Karyawan yang di-nonaktifkan (resign/dipecat) harus langsung kehilangan
  // akses mulai request berikutnya, walaupun JWT sesi lamanya di browser
  // masih valid sampai 8 jam ke depan. Ini satu-satunya tempat yang perlu
  // diubah karena semua route/page memanggil fungsi ini.
  if (!employee.isActive) return null;

  return employee;
}
