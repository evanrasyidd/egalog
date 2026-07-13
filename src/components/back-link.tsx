import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export function BackLink({
  href,
  label,
  className = "text-muted-foreground hover:text-foreground",
}: {
  href: string;
  label: string;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-1.5 text-sm transition-colors mb-4 ${className}`}
    >
      <ArrowLeft className="h-4 w-4" strokeWidth={1.75} />
      {label}
    </Link>
  );
}
