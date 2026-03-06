"use client";

import { useState, useEffect, useRef } from "react";

function easeOut(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

export default function AnimNum({
  target,
  dur = 1400,
}: {
  target: number;
  dur?: number;
}) {
  const [v, setV] = useState(0);
  const prev = useRef(0);

  useEffect(() => {
    const from = prev.current;
    const start = Date.now();
    const timer = setInterval(() => {
      const progress = Math.min((Date.now() - start) / dur, 1);
      setV(Math.round(from + (target - from) * easeOut(progress)));
      if (progress >= 1) {
        clearInterval(timer);
        prev.current = target;
      }
    }, 16);
    return () => clearInterval(timer);
  }, [target, dur]);

  return <>{v}</>;
}
