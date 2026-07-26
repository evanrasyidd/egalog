"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

const INACTIVITY_MS = 3 * 60 * 60 * 1000;
const CHECK_INTERVAL_MS = 30_000;
const STORAGE_KEY = "egalog_last_activity";
const DEBOUNCE_MS = 60_000;

export function ActivityTracker() {
  const router = useRouter();
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const now = Date.now();
    const last = localStorage.getItem(STORAGE_KEY);
    if (last && now - Number(last) > INACTIVITY_MS) {
      fetch("/api/auth/logout", { method: "POST" }).finally(() => {
        router.push("/login");
      });
      return;
    }
    localStorage.setItem(STORAGE_KEY, String(now));

    let lastUpdate = now;

    function handleActivity() {
      const ts = Date.now();
      if (ts - lastUpdate > DEBOUNCE_MS) {
        lastUpdate = ts;
        localStorage.setItem(STORAGE_KEY, String(ts));
      }
    }

    window.addEventListener("mousemove", handleActivity, { passive: true });
    window.addEventListener("click", handleActivity, { passive: true });
    window.addEventListener("keydown", handleActivity, { passive: true });
    window.addEventListener("touchstart", handleActivity, { passive: true });
    window.addEventListener("scroll", handleActivity, { passive: true });

    timerRef.current = setInterval(() => {
      const last = localStorage.getItem(STORAGE_KEY);
      if (last && Date.now() - Number(last) > INACTIVITY_MS) {
        fetch("/api/auth/logout", { method: "POST" }).finally(() => {
          router.push("/login");
        });
      }
    }, CHECK_INTERVAL_MS);

    return () => {
      window.removeEventListener("mousemove", handleActivity);
      window.removeEventListener("click", handleActivity);
      window.removeEventListener("keydown", handleActivity);
      window.removeEventListener("touchstart", handleActivity);
      window.removeEventListener("scroll", handleActivity);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [router]);

  return null;
}
