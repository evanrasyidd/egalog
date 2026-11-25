function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

function relativeLuminance(hex: string): number {
  const clean = hex.replace("#", "");
  const channels = [0, 2, 4].map((offset) => {
    const value = parseInt(clean.slice(offset, offset + 2), 16) / 255;
    return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

/** Inisial harus tetap terbaca di atas warna avatar yang macam-macam. */
function readableTextColor(hex: string): string {
  return relativeLuminance(hex) > 0.18 ? "#171b21" : "#ffffff";
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
      className={`${sizeClass} rounded-full flex items-center justify-center font-semibold shrink-0`}
      style={{ backgroundColor: avatarColor, color: readableTextColor(avatarColor) }}
      aria-hidden="true"
    >
      {getInitials(name)}
    </div>
  );
}
