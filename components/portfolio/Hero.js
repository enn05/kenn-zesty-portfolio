import { useEffect, useRef } from "react";
import * as THREE from "three";

function makeDotTexture() {
  const c = document.createElement("canvas"); c.width = c.height = 64;
  const g = c.getContext("2d"), grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  grad.addColorStop(0, "rgba(255,255,255,1)");
  grad.addColorStop(0.55, "rgba(255,255,255,.95)");
  grad.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = grad; g.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(c);
}

export default function Hero({ word = "KENN", lede, hint }) {
  const sectionRef = useRef(null);
  const wrapRef = useRef(null);
  const statusRef = useRef(null);
  const stateRef = useRef(null);
  const pctRef = useRef(null);

  useEffect(() => {
    const section = sectionRef.current, wrap = wrapRef.current;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) section.classList.add("reduced");

    let renderer;
    try { renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false }); }
    catch { section.classList.add("no-webgl"); return; }
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
    renderer.setClearColor(0x000000, 0);
    wrap.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, -10, 10);
    const material = new THREE.PointsMaterial({
      size: 3, map: makeDotTexture(), vertexColors: true, transparent: true, depthWrite: false,
    });
    const PAPER = new THREE.Color("#ECE8DF"), SODIUM = new THREE.Color("#F0A43A");
    const family = '"Big Shoulders"';
    const mouse = { x: 0, y: 0, active: false };

    let W = 0, H = 0, N = 0;
    let pos, vel, tgt, kArr, col;
    let geo = null, points = null;
    let raf = 0, running = false, visible = true, disposed = false, lastStatus = 0;
    let resizeTimer;

    const font = (s) => `800 ${s}px ${family}`;

    function sample() {
      const c = document.createElement("canvas"); c.width = W; c.height = H;
      const ctx = c.getContext("2d");
      ctx.font = font(200);
      const ratio = ctx.measureText(word).width / 200;
      const fs = Math.min((W * (W < 700 ? 0.9 : 0.78)) / ratio, H * 0.6);
      ctx.font = font(fs); ctx.fillStyle = "#fff"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText(word, W / 2, H * (W < 700 ? 0.38 : 0.44));
      const d = ctx.getImageData(0, 0, W, H).data;
      let ink = 0; for (let i = 3; i < d.length; i += 16) if (d[i] > 128) ink++;
      const gap = Math.max(3, Math.ceil(Math.sqrt((ink * 4) / (W < 700 ? 5000 : 12000))));
      const pts = [];
      for (let y = 0; y < H; y += gap) for (let x = 0; x < W; x += gap)
        if (d[(y * W + x) * 4 + 3] > 128) pts.push(x - W / 2, H / 2 - y);
      return { pts, gap };
    }

    function build(scatter) {
      W = wrap.clientWidth; H = wrap.clientHeight;
      const { pts, gap } = sample();
      N = pts.length / 2;
      tgt = new Float32Array(pts); pos = new Float32Array(N * 3); vel = new Float32Array(N * 2);
      kArr = new Float32Array(N); col = new Float32Array(N * 3);
      for (let i = 0; i < N; i++) {
        kArr[i] = 0.022 + Math.random() * 0.03;
        pos[i * 3] = scatter ? (Math.random() - 0.5) * W * 1.5 : tgt[i * 2];
        pos[i * 3 + 1] = scatter ? (Math.random() - 0.5) * H * 1.5 : tgt[i * 2 + 1];
      }
      camera.left = -W / 2; camera.right = W / 2; camera.top = H / 2; camera.bottom = -H / 2;
      camera.updateProjectionMatrix();
      renderer.setSize(W, H);
      material.size = Math.max(2, gap * 0.85);
      if (points) { scene.remove(points); geo.dispose(); }
      geo = new THREE.BufferGeometry();
      geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
      geo.setAttribute("color", new THREE.BufferAttribute(col, 3));
      points = new THREE.Points(geo, material);
      scene.add(points);
    }

    function step(now) {
      const R = Math.max(70, Math.min(W, H) * 0.13), R2 = R * R, PUSH = 5.5, DAMP = 0.86;
      let settled = 0;
      for (let i = 0; i < N; i++) {
        const ix = i * 3, iv = i * 2, px = pos[ix], py = pos[ix + 1];
        if (mouse.active) {
          const dx = px - mouse.x, dy = py - mouse.y, d2 = dx * dx + dy * dy;
          if (d2 < R2 && d2 > 0.01) {
            const d = Math.sqrt(d2), f = (1 - d / R) * PUSH;
            vel[iv] += (dx / d) * f; vel[iv + 1] += (dy / d) * f;
          }
        }
        const tx = tgt[iv] - px, ty = tgt[iv + 1] - py, k = kArr[i];
        vel[iv] = (vel[iv] + tx * k) * DAMP;
        vel[iv + 1] = (vel[iv + 1] + ty * k) * DAMP;
        pos[ix] += vel[iv]; pos[ix + 1] += vel[iv + 1];
        const dist = Math.sqrt(tx * tx + ty * ty);
        if (dist < 1.5) settled++;
        const t = dist > 60 ? 1 : dist / 60;
        col[ix] = PAPER.r + (SODIUM.r - PAPER.r) * t;
        col[ix + 1] = PAPER.g + (SODIUM.g - PAPER.g) * t;
        col[ix + 2] = PAPER.b + (SODIUM.b - PAPER.b) * t;
      }
      geo.attributes.position.needsUpdate = true;
      geo.attributes.color.needsUpdate = true;
      if (now - lastStatus > 200) {
        lastStatus = now;
        const pct = N ? Math.floor((settled / N) * 100) : 100;
        pctRef.current.textContent = `${pct}%`;
        stateRef.current.textContent = pct < 99 ? "Reconciling" : "Stable";
        statusRef.current.classList.toggle("is-busy", pct < 99);
      }
    }

    const loop = (now) => {
      step(now); renderer.render(scene, camera);
      raf = running ? requestAnimationFrame(loop) : 0;
    };
    const setRunning = () => {
      const should = visible && !document.hidden && !reduced && !disposed;
      if (should && !running) { running = true; raf = requestAnimationFrame(loop); }
      running = should;
    };

    const onMove = (e) => {
      const r = wrap.getBoundingClientRect();
      mouse.x = e.clientX - r.left - W / 2; mouse.y = H / 2 - (e.clientY - r.top); mouse.active = true;
    };
    const onLeave = () => { mouse.active = false; };
    const onUp = (e) => { if (e.pointerType !== "mouse") mouse.active = false; };

    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; setRunning(); });
    const ro = new ResizeObserver(() => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        if (Math.abs(wrap.clientWidth - W) < 2 && Math.abs(wrap.clientHeight - H) < 90) return;
        build(false);
        if (!running) { step(0); renderer.render(scene, camera); }
      }, 220);
    });

    (async () => {
      try {
        await Promise.race([document.fonts.load(font(200)), new Promise(r => setTimeout(r, 2500))]);
      } catch {}
      if (disposed) return;
      build(!reduced);
      if (reduced) { step(0); renderer.render(scene, camera); }
      setRunning();
      io.observe(section); ro.observe(wrap);
      document.addEventListener("visibilitychange", setRunning);
      section.addEventListener("pointermove", onMove);
      section.addEventListener("pointerdown", onMove);
      section.addEventListener("pointerleave", onLeave);
      section.addEventListener("pointercancel", onLeave);
      section.addEventListener("pointerup", onUp);
    })();

    return () => {
      disposed = true; running = false;
      cancelAnimationFrame(raf); clearTimeout(resizeTimer);
      io.disconnect(); ro.disconnect();
      document.removeEventListener("visibilitychange", setRunning);
      section.removeEventListener("pointermove", onMove);
      section.removeEventListener("pointerdown", onMove);
      section.removeEventListener("pointerleave", onLeave);
      section.removeEventListener("pointercancel", onLeave);
      section.removeEventListener("pointerup", onUp);
      geo?.dispose(); material.map?.dispose(); material.dispose();
      renderer.dispose(); renderer.domElement.remove();
    };
  }, [word]);

  return (
    <section className="hero" id="top" ref={sectionRef} aria-label="Introduction">
      <div className="hero-canvas" ref={wrapRef} aria-hidden="true" />
      <h1 className="hero-title">{word.charAt(0) + word.slice(1).toLowerCase()}</h1>
      <div className="hero-foot">
        <p className="hero-lede">{lede}</p>
        <div className="hero-side" aria-hidden="true">
          <p className="hero-hint">{hint}</p>
          <p className="hero-status" ref={statusRef}>
            <span className="status-dot" /><span ref={stateRef}>Reconciling</span><span ref={pctRef}>0%</span>
          </p>
        </div>
        <a className="scroll-cue" href="#intro">Scroll</a>
      </div>
    </section>
  );
}