"use client";

import { useEffect, useRef } from "react";
import { mountStarfield } from "@/lib/starfield-canvas";

export default function StarfieldBg({ variant = "night" }: Props) {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!ref.current) return;

    const night = {
      bgInner: "#1b2735",
      bgOuter: "#090a0f",
    };

    const light = {
      // “昼”は白っぽい粒子にすると良い（とりあえず仮）
      bgInner: "#f3f7ff",
      bgOuter: "#dbe7ff",
      layers: [
        { count: 240, rMin: 0.6, rMax: 1.4, speed: 3,  alphaMin: 0.05, alphaMax: 0.18, twinkle: 0.08 },
        { count: 120, rMin: 1.0, rMax: 2.0, speed: 7,  alphaMin: 0.05, alphaMax: 0.22, twinkle: 0.06 },
        { count: 50,  rMin: 1.6, rMax: 3.0, speed: 12, alphaMin: 0.06, alphaMax: 0.25, twinkle: 0.04 },
      ],
      driftX: 0.3,
    };

    const ctrl = mountStarfield(ref.current, variant === "night" ? night : light);
    return () => ctrl.destroy();
  }, [variant]);

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full"
    />
  );
}