import { useEffect, useRef } from 'react';

/**
 * Drifting dots that link to nearby neighbours — the "constellation" background.
 *
 * Ported from the static portfolio (enn05/portfoliov2, assets/scripts/app.js).
 * The simulation is unchanged; what is added is what a SPA needs and a static
 * page did not:
 *   - full teardown on unmount, so client-side navigation cannot leak a canvas
 *     or an orphaned requestAnimationFrame loop
 *   - a running flag, so the visibilitychange handler cannot start a second
 *     RAF loop on top of a live one
 *   - device-pixel-ratio scaling, so the dots are not soft on retina screens
 *
 * Colour comes from --sodium (#F0A43A), the design token, rather than the
 * hard-coded #FAA61A of the original — near-identical, but stays in step if
 * the palette changes.
 */
export default function ConstellationBg({ linkDistance = 130, maxDots = 70 }) {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const accent =
      getComputedStyle(document.documentElement)
        .getPropertyValue('--sodium')
        .trim() || '#F0A43A';
    const rgb = (() => {
      const h = accent.replace('#', '');
      return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
    })();
    const DOT = `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, 0.55)`;
    const LINE = `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, `;

    let width = 0;
    let height = 0;
    let dots = [];
    let raf = 0;
    let running = false;
    let disposed = false;
    let resizeTimer;

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Density scales with viewport area, capped — same formula as the original.
      const target = Math.min(maxDots, Math.floor((width * height) / 22000));
      dots = Array.from({ length: target }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        r: Math.random() * 1.8 + 0.8,
      }));
    }

    function draw() {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < dots.length; i++) {
        const p = dots[i];
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = DOT;
        ctx.fill();

        for (let j = i + 1; j < dots.length; j++) {
          const q = dots[j];
          const dx = p.x - q.x;
          const dy = p.y - q.y;
          const dist = Math.hypot(dx, dy);
          if (dist < linkDistance) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.strokeStyle = `${LINE}${0.25 * (1 - dist / linkDistance)})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }

      raf = running ? requestAnimationFrame(draw) : 0;
    }

    const start = () => {
      if (running || disposed) return;
      running = true;
      raf = requestAnimationFrame(draw);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
      raf = 0;
    };

    // The guard matters: without `running`, a second visibilitychange would
    // queue a parallel RAF loop and the dots would move at double speed.
    const onVisibility = () => (document.hidden ? stop() : start());
    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resize, 150);
    };

    resize();
    start();
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('resize', onResize);

    return () => {
      disposed = true;
      stop();
      clearTimeout(resizeTimer);
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('resize', onResize);
    };
  }, [linkDistance, maxDots]);

  return <canvas className="bg-canvas" ref={ref} aria-hidden="true" />;
}
