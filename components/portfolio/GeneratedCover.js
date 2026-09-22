import { useEffect, useRef } from 'react';

export default function GeneratedCover({ seed, className }) {
  const ref = useRef(null);

  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    let h = 2166136261;
    for (const ch of seed) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
    const rnd = () => {
      h += 0x6D2B79F5; let t = h;
      t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61);
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
    const W = 800, H = 600, x = c.getContext('2d');
    x.fillStyle = '#16233B'; x.fillRect(0, 0, W, H);
    const rowH = 14 + Math.floor(rnd() * 8);
    for (let y = 36; y < H - 30; y += rowH) {
      let cx = 40 + Math.floor(rnd() * 5) * 28;
      while (cx < W - 60) {
        const len = 12 + rnd() * 150, hot = rnd() < 0.05;
        x.fillStyle = hot ? '#F0A43A' : `rgba(236,232,223,${(0.07 + rnd() * 0.22).toFixed(2)})`;
        x.fillRect(cx, y, Math.min(len, W - 40 - cx), 5);
        cx += len + 8 + rnd() * 36;
        if (rnd() < 0.14) break;
      }
    }
  }, [seed]);

  return <canvas ref={ref} className={className} width={800} height={600} aria-hidden="true" />;
}