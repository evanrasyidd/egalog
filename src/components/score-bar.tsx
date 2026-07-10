function toneForScore(score: number): string {
  if (score >= 4) return "bg-success";
  if (score >= 3) return "bg-warning";
  return "bg-danger";
}

export function ScoreBar({ label, score }: { label: string; score: number }) {
  const widthPercent = (score / 5) * 100;
  return (
    <div>
      <div className="flex items-center justify-between text-xs mb-1">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-mono font-medium">{score}/5</span>
      </div>
      <div className="h-1.5 rounded-full bg-surface-muted overflow-hidden">
        <div
          className={`h-full rounded-full ${toneForScore(score)}`}
          style={{ width: `${widthPercent}%` }}
        />
      </div>
    </div>
  );
}
