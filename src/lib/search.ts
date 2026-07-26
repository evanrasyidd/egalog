import "server-only";
import { employees, announcements } from "./db";
import type { SearchResult } from "./types";

export function globalSearch(query: string): SearchResult[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];

  const results: SearchResult[] = [];

  for (const emp of employees) {
    if (!emp.isActive) continue;
    if (
      emp.name.toLowerCase().includes(q) ||
      emp.nip.toLowerCase().includes(q) ||
      emp.email.toLowerCase().includes(q) ||
      emp.jobTitle.toLowerCase().includes(q)
    ) {
      results.push({
        type: "karyawan",
        label: emp.name,
        description: `${emp.nip} · ${emp.jobTitle}`,
        link: `/karyawan/${emp.id}`,
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
