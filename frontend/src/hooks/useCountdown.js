import { useState, useEffect } from "react";

export function useCountdown(initialMs) {
  const [remaining, setRemaining] = useState(0);

  //  FIX: jab bhi new time aaye → reset ho
  useEffect(() => {
    if (initialMs > 0) {
      setRemaining(initialMs);
    }
  }, [initialMs]);

  useEffect(() => {
    if (remaining <= 0) return;

    const interval = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1000) return 0;
        return prev - 1000;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [remaining]);

  const h = Math.floor(remaining / (1000 * 60 * 60));
  const m = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
  const s = Math.floor((remaining % (1000 * 60)) / 1000);

  const formattedTime = `${h}h ${m}m ${s}s`;

  return { remaining, formattedTime };
}