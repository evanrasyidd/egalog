export function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/60 backdrop-blur-sm">
      <div
        className="h-14 w-14 rounded-2xl flex items-center justify-center animate-spin"
        style={{ backgroundColor: "#1E2A44" }}
        role="status"
        aria-label="Memuat"
      >
        <span
          className="text-xl font-extrabold"
          style={{ color: "#C96A2E", fontFamily: "sans-serif" }}
        >
          E
        </span>
      </div>
    </div>
  );
}
