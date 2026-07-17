type TeamScoreEntry = { name: string; score: number | null };

const ROW_HEIGHT = 32;
const BAR_MAX_WIDTH = 100; // persen lebar track

function scoreColor(score: number): string {
  if (score >= 4) return "bg-success";
  if (score >= 3) return "bg-primary";
  return "bg-danger";
}

function scoreLabel(score: number): string {
  if (score >= 4) return "Baik";
  if (score >= 3) return "Cukup";
  return "Perlu perhatian";
}

/** Bar chart horizontal skor review terakhir tiap anggota tim — CSS bar (bukan lib chart), solid color token, no gradient. */
export function TeamScoreChart({ entries }: { entries: TeamScoreEntry[] }) {
  if (entries.length === 0) return null;

  const scored = entries.filter((e) => e.score !== null) as { name: string; score: number }[];
  const unrated = entries.length - scored.length;
  const avg =
    scored.length > 0
      ? (scored.reduce((sum, e) => sum + e.score, 0) / scored.length).toFixed(1)
      : "—";

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-xs text-muted-foreground">
        <span>
          Rata-rata tim:{" "}
          <span className="font-mono font-medium text-foreground">{avg}/5</span>
        </span>
        <span>{scored.length} dinilai</span>
        {unrated > 0 && (
          <span className="rounded-full bg-surface-muted px-2 py-0.5">
            {unrated} belum direview
          </span>
        )}
      </div>

      <div
        role="img"
        aria-label={`Skor review terakhir tim: ${entries
          .map((e) => `${e.name} ${e.score !== null ? `${e.score} dari 5 (${scoreLabel(e.score)})` : "belum ada review"}`)
          .join(", ")}`}
        className="space-y-3"
      >
        {entries.map((e) => {
          const widthPct = e.score !== null ? (e.score / 5) * BAR_MAX_WIDTH : 0;
          return (
            <div key={e.name} className="flex items-center gap-3" style={{ height: ROW_HEIGHT }}>
              <span className="w-28 shrink-0 truncate text-xs text-muted-foreground" title={e.name}>
                {e.name}
              </span>
              <div className="flex-1 h-2.5 rounded-full bg-surface-muted overflow-hidden">
                {e.score !== null && (
                  <div
                    className={`h-full rounded-full ${scoreColor(e.score)}`}
                    style={{ width: `${widthPct}%` }}
                  />
                )}
              </div>
              <span className="w-20 shrink-0 text-right text-xs font-mono font-medium">
                {e.score !== null ? (
                  <span className="inline-flex items-center gap-1">
                    {e.score}/5
                    <span className="hidden sm:inline text-[10px] font-normal text-muted-foreground">
                      {scoreLabel(e.score)}
                    </span>
                  </span>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
