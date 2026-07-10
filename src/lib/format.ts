export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatPeriodLabel(period: string): string {
  const [year, month] = period.split("-").map(Number);
  return new Date(year, month - 1, 1).toLocaleDateString("id-ID", {
    month: "long",
    year: "numeric",
  });
}

export function getCurrentCycle(): string {
  const now = new Date();
  const quarter = Math.floor(now.getMonth() / 3) + 1;
  return `${now.getFullYear()}-Q${quarter}`;
}

export function formatCycleLabel(cycle: string): string {
  const [year, q] = cycle.split("-Q");
  return `Kuartal ${q} ${year}`;
}

/** Opsi siklus untuk dropdown: kuartal sekarang + 1 sebelumnya + 1 berikutnya. */
export function getCycleOptions(): string[] {
  const now = new Date();
  const currentQuarterIndex = Math.floor(now.getMonth() / 3); // 0-3
  const baseYear = now.getFullYear();

  const toCycle = (year: number, qIndex: number) => `${year}-Q${qIndex + 1}`;

  const options: { year: number; qIndex: number }[] = [];
  for (const offset of [-1, 0, 1]) {
    let qIndex = currentQuarterIndex + offset;
    let year = baseYear;
    if (qIndex < 0) {
      qIndex += 4;
      year -= 1;
    } else if (qIndex > 3) {
      qIndex -= 4;
      year += 1;
    }
    options.push({ year, qIndex });
  }

  return options.map((o) => toCycle(o.year, o.qIndex));
}
