export function StampBadge({
  label,
  className = "",
}: {
  label: string;
  className?: string;
}) {
  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full border-2 border-dashed border-accent px-4 py-1.5 -rotate-2 ${className}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden="true" />
      <span className="text-xs font-mono font-semibold tracking-wider text-accent uppercase">
        {label}
      </span>
    </div>
  );
}
