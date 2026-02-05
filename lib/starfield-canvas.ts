export type StarfieldOptions = {
  bgInner?: string;
  bgOuter?: string;
  layers?: Array<{
    count: number;
    rMin: number;
    rMax: number;
    speed: number; // px/s
    alphaMin: number;
    alphaMax: number;
    twinkle: number;
  }>;
  driftX?: number; // px/s
  pauseWhenHidden?: boolean;
};

export function mountStarfield(canvas: HTMLCanvasElement, opts: StarfieldOptions = {}) {
  const ctx = canvas.getContext("2d", { alpha: true });
  if (!ctx) return { destroy() {} };

  let dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));

  const o = {
    bgInner: "#1b2735",
    bgOuter: "#090a0f",
    layers: [
      { count: 1400, rMin: 0.3, rMax: 0.8, speed: 2.2, alphaMin: 0.08, alphaMax: 0.25, twinkle: 0.12 },
      { count: 700, rMin: 0.5, rMax: 1.2, speed: 3.2,  alphaMin: 0.25, alphaMax: 0.7,  twinkle: 0.18 },
      { count: 260, rMin: 1.0, rMax: 2.0, speed: 9.5, alphaMin: 0.3, alphaMax: 0.85, twinkle: 0.10 },
      { count: 110, rMin: 1.6, rMax: 3.0, speed: 18, alphaMin: 0.35, alphaMax: 0.95, twinkle: 0.06 },
    ],
    driftX: 0.8,
    pauseWhenHidden: true,
    ...opts,
  };

  let w = 0, h = 0;
  let raf: number | null = null;
  let running = true;
  let resizeRaf: number | null = null;

  const rand = (a: number, b: number) => a + Math.random() * (b - a);

  type Star = { x: number; y: number; r: number; a: number; phase: number };
  type Layer = (typeof o.layers)[number] & { stars: Star[]; density: number };

  let layers: Layer[] = [];
  let bandCanvas: HTMLCanvasElement | null = null;
  let bandParams:
    | {
        originX: number;
        originY: number;
        angle: number;
        bandWidth: number;
        coreWidth: number;
        arcRadius: number;
        arcSpan: number;
        arcCenterY: number;
      }
    | null = null;

  function makeStar(L: (typeof o.layers)[number], randomY = false): Star {
    return {
      x: rand(0, w),
      y: randomY ? rand(0, h) : rand(-h, 0),
      r: rand(L.rMin, L.rMax),
      a: rand(L.alphaMin, L.alphaMax),
      phase: rand(0, Math.PI * 2),
    };
  }

  function applyResize() {
    const prevW = w || 1;
    const prevH = h || 1;
    dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    const rect = canvas.getBoundingClientRect();
    w = Math.max(1, Math.floor(rect.width));
    h = Math.max(1, Math.floor(rect.height));

    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    if (layers.length === 0) {
      layers = o.layers.map((L) => ({
        ...L,
        density: L.count / (w * h),
        stars: new Array(L.count).fill(0).map(() => makeStar(L, true)),
      }));
    } else {
      for (const L of layers) {
        const desired = Math.max(1, Math.round(L.density * w * h));

        // If shrinking, drop stars outside bounds first
        if (L.stars.length > desired || w < prevW || h < prevH) {
          L.stars = L.stars.filter((s) => s.x <= w && s.y <= h);
          if (L.stars.length > desired) {
            L.stars.length = desired;
          }
        }

        // If expanding, add new stars in the newly revealed area
        if (L.stars.length < desired) {
          const need = desired - L.stars.length;
          for (let i = 0; i < need; i++) {
            let sx = rand(0, w);
            let sy = rand(0, h);
            if (w > prevW || h > prevH) {
              let tries = 0;
              while (tries < 12) {
                const tx = rand(0, w);
                const ty = rand(0, h);
                const inNewX = tx > prevW;
                const inNewY = ty > prevH;
                if (inNewX || inNewY) {
                  sx = tx;
                  sy = ty;
                  break;
                }
                tries++;
              }
            }
            const s = makeStar(L, true);
            s.x = sx;
            s.y = sy;
            L.stars.push(s);
          }
        }
      }
    }

    if (!bandCanvas) {
      bandCanvas = buildGalaxyBand();
    } else if (w > bandCanvas.width || h > bandCanvas.height) {
      const oldW = bandCanvas.width;
      const oldH = bandCanvas.height;
      const next = document.createElement("canvas");
      next.width = w;
      next.height = h;
      const g = next.getContext("2d");
      if (g) {
        g.drawImage(bandCanvas, 0, 0);
        if (bandParams) {
          if (w > oldW) {
            g.save();
            g.beginPath();
            g.rect(oldW, 0, w - oldW, h);
            g.clip();
            drawGalaxyBand(g, bandParams);
            g.restore();
          }
          if (h > oldH) {
            g.save();
            g.beginPath();
            g.rect(0, oldH, oldW, h - oldH);
            g.clip();
            drawGalaxyBand(g, bandParams);
            g.restore();
          }
        }
      }
      bandCanvas = next;
    }

    // Draw a frame immediately to prevent a white flash after canvas resize
    drawBackground();
    if (bandCanvas) {
      ctx.save();
      ctx.globalCompositeOperation = "screen";
      ctx.globalAlpha = 0.9;
      ctx.drawImage(bandCanvas, 0, 0);
      ctx.restore();
    }
    drawStars(performance.now());
  }
  function resize() {
    if (resizeRaf != null) return;
    resizeRaf = requestAnimationFrame(() => {
      resizeRaf = null;
      applyResize();
    });
  }

  function drawBackground() {
    const cx = w * 0.5;
    const cy = h * 1.05; // ちょい下中心
    const r0 = Math.min(w, h) * 0.15;
    const r1 = Math.max(w, h) * 1.05;

    const g = ctx.createRadialGradient(cx, cy, r0, cx, cy, r1);
    g.addColorStop(0, o.bgInner);
    g.addColorStop(1, o.bgOuter);

    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  }

  const randn = () => {
    // Box-Muller
    let u = 0;
    let v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  };

  function createBandParams(baseW: number, baseH: number) {
    const angle = -25 * (Math.PI / 180);
    const bandWidth = Math.min(baseW, baseH) * 0.55;
    const coreWidth = bandWidth * 0.35;
    const arcRadius = Math.max(baseW, baseH) * 1.45;
    const arcSpan = 1.6; // radians
    const arcCenterY = arcRadius * 0.95;
    return {
      originX: baseW * 0.5,
      originY: baseH * 0.5,
      angle,
      bandWidth,
      coreWidth,
      arcRadius,
      arcSpan,
      arcCenterY,
    };
  }

  function drawGalaxyBand(g: CanvasRenderingContext2D, p: NonNullable<typeof bandParams>) {
    const { originX, originY, angle, bandWidth, coreWidth, arcRadius, arcSpan, arcCenterY } = p;

    g.save();
    g.translate(originX, originY);
    g.rotate(angle);

    const drawArcRibbon = (
      inner: string,
      mid: string,
      outer: string,
      rInner: number,
      rOuter: number
    ) => {
      const step = (bandWidth * 0.16) / arcRadius;
      for (let t = -arcSpan * 0.5; t <= arcSpan * 0.5; t += step) {
        const x = Math.sin(t) * arcRadius;
        const y = -Math.cos(t) * arcRadius + arcCenterY;
        const grad = g.createRadialGradient(x, y, rInner, x, y, rOuter);
        grad.addColorStop(0, inner);
        grad.addColorStop(0.55, mid);
        grad.addColorStop(1, outer);
        g.fillStyle = grad;
        g.beginPath();
        g.arc(x, y, rOuter, 0, Math.PI * 2);
        g.fill();
      }
    };

    // Wide soft band (curved)
    drawArcRibbon(
      "rgba(255,255,255,0.16)",
      "rgba(170,190,255,0.08)",
      "rgba(255,255,255,0)",
      bandWidth * 0.05,
      bandWidth * 0.55
    );

    // Colored outer haze (red/blue), with irregular softness
    const haze = g.createLinearGradient(0, -bandWidth * 0.6, 0, bandWidth * 0.6);
    haze.addColorStop(0, "rgba(100,140,255,0)");
    haze.addColorStop(0.2, "rgba(120,170,255,0.09)");
    haze.addColorStop(0.5, "rgba(255,160,140,0.08)");
    haze.addColorStop(0.8, "rgba(120,160,255,0.07)");
    haze.addColorStop(1, "rgba(255,140,120,0)");
    g.fillStyle = haze;
    drawArcRibbon(
      "rgba(120,170,255,0.08)",
      "rgba(255,160,140,0.07)",
      "rgba(120,170,255,0)",
      bandWidth * 0.08,
      bandWidth * 0.7
    );

    // Blue ribbon variation along the band (soft + non-uniform width)
    const blueStep = bandWidth * 0.16;
    for (let t = -arcSpan * 0.5; t <= arcSpan * 0.5; t += blueStep / arcRadius) {
      const cx = Math.sin(t) * arcRadius;
      const cy = -Math.cos(t) * arcRadius + arcCenterY;
      const nx = cx / arcRadius;
      const ny = (cy - arcCenterY) / arcRadius;
      const y = randn() * (bandWidth * 0.18);
      const x = cx + nx * y;
      const yy = cy + ny * y;
      const rX = rand(bandWidth * 0.18, bandWidth * 0.38);
      const rY = rand(bandWidth * 0.06, bandWidth * 0.16);
      const a = rand(0.04, 0.1);
      const grad = g.createRadialGradient(x, yy, 0, x, yy, rX);
      grad.addColorStop(0, `rgba(120,170,255,${a})`);
      grad.addColorStop(0.5, `rgba(120,170,255,${a * 0.6})`);
      grad.addColorStop(1, "rgba(120,170,255,0)");
      g.save();
      g.scale(1, rY / rX);
      g.fillStyle = grad;
      g.beginPath();
      g.arc(x, yy / (rY / rX), rX, 0, Math.PI * 2);
      g.fill();
      g.restore();
    }

    // Irregular outer halo (continuous, connected ribbon)
    const haloColors = [
      "rgba(120,170,255,0.06)",
      "rgba(255,170,140,0.06)",
      "rgba(150,190,255,0.05)",
      "rgba(255,190,160,0.05)",
    ];
    const step = bandWidth * 0.12;
    let drift = 0;
    for (let t = -arcSpan * 0.5; t <= arcSpan * 0.5; t += step / arcRadius) {
      const cx = Math.sin(t) * arcRadius;
      const cy = -Math.cos(t) * arcRadius + arcCenterY;
      const nx = cx / arcRadius;
      const ny = (cy - arcCenterY) / arcRadius;
      drift += randn() * (bandWidth * 0.02);
      drift = Math.max(-bandWidth * 0.45, Math.min(bandWidth * 0.45, drift));
      const y = randn() * (bandWidth * 0.08) + drift;
      const x = cx + nx * y;
      const yy = cy + ny * y;
      const r = rand(bandWidth * 0.12, bandWidth * 0.28);
      const base = haloColors[Math.floor(Math.random() * haloColors.length)];
      const grad = g.createRadialGradient(x, yy, 0, x, yy, r);
      grad.addColorStop(0, base.replace("0.06", "0.08").replace("0.05", "0.07"));
      grad.addColorStop(0.55, base);
      grad.addColorStop(1, base.replace("0.06", "0").replace("0.05", "0"));
      g.fillStyle = grad;
      g.beginPath();
      g.arc(x, yy, r, 0, Math.PI * 2);
      g.fill();
    }

    // Brighter core removed (keep softer band only)

    // Mottled dust (noise-like clusters)
    const dustColors = [
      "rgba(255,255,255,0.12)",
      "rgba(180,200,255,0.12)",
      "rgba(120,160,255,0.12)",
      "rgba(255,160,140,0.12)",
      "rgba(210,170,140,0.12)",
    ];
    for (let i = 0; i < 1400; i++) {
      const t = rand(-arcSpan * 0.5, arcSpan * 0.5);
      const cx = Math.sin(t) * arcRadius;
      const cy = -Math.cos(t) * arcRadius + arcCenterY;
      const nx = cx / arcRadius;
      const ny = (cy - arcCenterY) / arcRadius;
      const off = randn() * (coreWidth * 0.55);
      const x = cx + nx * off;
      const y = cy + ny * off;
      const r = rand(0.4, 1.6);
      g.fillStyle = dustColors[i % dustColors.length];
      g.beginPath();
      g.arc(x, y, r, 0, Math.PI * 2);
      g.fill();
    }

    // Brighter knots
    for (let i = 0; i < 90; i++) {
      const t = rand(-arcSpan * 0.5, arcSpan * 0.5);
      const cx = Math.sin(t) * arcRadius;
      const cy = -Math.cos(t) * arcRadius + arcCenterY;
      const nx = cx / arcRadius;
      const ny = (cy - arcCenterY) / arcRadius;
      const off = randn() * (coreWidth * 0.35);
      const x = cx + nx * off;
      const y = cy + ny * off;
      const r = rand(1.5, 4.0);
      const a = rand(0.06, 0.2);
      g.fillStyle = `rgba(255,245,230,${a})`;
      g.beginPath();
      g.arc(x, y, r, 0, Math.PI * 2);
      g.fill();
    }

    g.restore();
  }

  function buildGalaxyBand() {
    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    const g = c.getContext("2d");
    if (!g) return c;
    if (!bandParams) bandParams = createBandParams(w, h);
    drawGalaxyBand(g, bandParams);
    return c;
  }

  function drawStars(t: number) {
    for (const L of layers) {
      for (const s of L.stars) {
        const tw = L.twinkle
          ? (Math.sin(t / 1000 + s.phase) * 0.5 + 0.5) * L.twinkle
          : 0;

        const a = Math.max(0, Math.min(1, s.a * (1 - L.twinkle + tw)));
        ctx.beginPath();
        ctx.fillStyle = `rgba(255,255,255,${a})`;
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  let tPrev = performance.now();
  function tick(t: number) {
    if (!running) return;

    const dt = Math.min(0.05, (t - tPrev) / 1000);
    tPrev = t;

    drawBackground();

    if (bandCanvas) {
      ctx.save();
      ctx.globalCompositeOperation = "screen";
      ctx.globalAlpha = 0.9;
      ctx.drawImage(bandCanvas, 0, 0);
      ctx.restore();
    }

    for (const L of layers) {
      for (const s of L.stars) {
        s.y += L.speed * dt;
        s.x += o.driftX * dt;

        if (s.y > h + 4) {
          s.y = -4;
          s.x = rand(0, w);
          s.r = rand(L.rMin, L.rMax);
          s.a = rand(L.alphaMin, L.alphaMax);
          s.phase = rand(0, Math.PI * 2);
        }
        if (s.x > w + 4) s.x = -4;
      }
    }

    drawStars(t);
    raf = requestAnimationFrame(tick);
  }

  const ro = new ResizeObserver(resize);
  ro.observe(canvas);
  window.addEventListener("resize", resize);

  applyResize();
  raf = requestAnimationFrame(tick);

  function onVis() {
    if (!o.pauseWhenHidden) return;
    running = document.visibilityState === "visible";
    if (running && raf == null) {
      tPrev = performance.now();
      raf = requestAnimationFrame(tick);
    }
    if (!running && raf != null) {
      cancelAnimationFrame(raf);
      raf = null;
    }
  }
  document.addEventListener("visibilitychange", onVis);

  return {
    destroy() {
      ro.disconnect();
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVis);
      if (raf != null) cancelAnimationFrame(raf);
      raf = null;
    },
  };
}
