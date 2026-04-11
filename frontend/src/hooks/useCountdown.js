import { useState, useEffect } from "react";

export function useCountdown(initialMs) {
  const [remaining, setRemaining] = useState(initialMs || 0);

  useEffect(() => {
    if (!initialMs || initialMs <= 0) {
      setRemaining(0);
      return;
    }

    const start = Date.now();

    const interval = setInterval(() => {
      const elapsed = Date.now() - start;
      const left = Math.max(initialMs - elapsed, 0);

      setRemaining(left);

      if (left === 0) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [initialMs]); // ✅ only depends on initialMs

  const h = Math.floor(remaining / (1000 * 60 * 60));
  const m = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
  const s = Math.floor((remaining % (1000 * 60)) / 1000);

  const formattedTime = `${h}h ${m}m ${s}s`;

  return { remaining, formattedTime };
}