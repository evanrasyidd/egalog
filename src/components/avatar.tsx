function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

const SIZE_CLASSES = {
  xs: "h-6 w-6 text-[10px]",
  sm: "h-8 w-8 text-xs",
  md: "h-9 w-9 text-xs",
  lg: "h-16 w-16 text-xl",
} as const;

export function Avatar({
  name,
  avatarColor,
  avatarPhoto,
  size = "md",
}: {
  name: string;
  avatarColor: string;
  avatarPhoto?: string | null;
  size?: keyof typeof SIZE_CLASSES;
}) {
  const sizeClass = SIZE_CLASSES[size];

  if (avatarPhoto) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={avatarPhoto}
        alt={name}
        className={`${sizeClass} rounded-full object-cover shrink-0`}
      />
    );
  }

  return (
    <div
      className={`${sizeClass} rounded-full flex items-center justify-center font-semibold text-white shrink-0`}
      style={{ backgroundColor: avatarColor }}
      aria-hidden="true"
    >
      {getInitials(name)}
    </div>
  );
}
