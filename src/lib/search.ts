import "server-only";
import { employees, announcements, getSubordinateIds } from "./db";
import { canViewAllEmployees } from "./permissions";
import type { Employee, SearchResult } from "./types";

/**
 * Pencarian global hanya menampilkan karyawan yang memang boleh dilihat oleh
 * pencari. Sebelumnya semua staf bisa menemukan seluruh direktori lewat
 * pencarian meskipun halaman detailnya menolak akses — kebocoran data yang
 * tidak kelihatan dari UI.
 */
export function globalSearch(query: string, viewer: Employee): SearchResult[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];

  const results: SearchResult[] = [];
  const seesAll = canViewAllEmployees(viewer);
  const subordinateIds = seesAll ? null : getSubordinateIds(viewer.id);

  for (const emp of employees) {
    if (!emp.isActive) continue;
    if (emp.id !== viewer.id && !seesAll && !subordinateIds?.has(emp.id)) continue;
    if (
      emp.name.toLowerCase().includes(q) ||
      emp.nip.toLowerCase().includes(q) ||
      emp.email.toLowerCase().includes(q) ||
      emp.jobTitle.toLowerCase().includes(q)
    ) {
      results.push({
        type: "karyawan",
        label: emp.name,
        description:
          emp.id === viewer.id ? `${emp.nip} · Profil kamu` : `${emp.nip} · ${emp.jobTitle}`,
        link: emp.id === viewer.id ? "/profile" : `/karyawan/${emp.id}`,
      });
    }
  }

  if (results.length >= 20) return results;

  for (const ann of announcements) {
    if (ann.title.toLowerCase().includes(q) || ann.content.toLowerCase().includes(q)) {
      results.push({
        type: "pengumuman",
        label: ann.title,
        description: ann.content.slice(0, 80),
        link: "/pengumuman",
      });
    }
  }

  return results.slice(0, 20);
}
