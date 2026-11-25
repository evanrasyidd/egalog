import type { EmploymentType, WorkArrangement } from "./types";

export const EMPLOYMENT_TYPE_LABEL: Record<EmploymentType, string> = {
  full_time: "Full-time",
  kontrak: "Kontrak",
  magang: "Magang",
};

export const WORK_ARRANGEMENT_LABEL: Record<WorkArrangement, string> = {
  onsite: "On-site",
  hybrid: "Hybrid",
  remote: "Remote",
};
