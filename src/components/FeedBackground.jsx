import { useEffect, useRef } from "react";

const COLORS = ["#ffffff", "#ff9ff3", "#7dd3fc", "#a5b4fc", "#fbbf24", "#ff5f7a", "#67e8f9"];

const rand = (min, max) => min + Math.random() * (max - min);
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

const COUNT = 100;
const MAX_SPEED = 0.9;
const LINK_DIST = 110;
const LINK_ALPHA = 0.3;

const FeedBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    let width = window.innerWidth;
    let height = window.innerHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const particles = Array.from({ length: COUNT }, (_, i) => ({
      r: rand(1, 3),
      color: pick(COLORS),
      alpha: rand(0.5, 0.9),
      phase: rand(0, Math.PI * 2),
      pulseRate: rand(0.8, 2),
      x: rand(0, width),
      y: rand(0, height),
      vx: rand(-0.7, 0.7),
      vy: rand(-0.7, 0.7),
    }));

    let raf;

    const step = (t) => {
      ctx.clearRect(0, 0, width, height);
      ctx.globalCompositeOperation = "lighter";

      for (const p of particles) {
        p.vx += rand(-0.02, 0.02);
        p.vy += rand(-0.02, 0.02);
        const speed = Math.hypot(p.vx, p.vy);
        if (speed > MAX_SPEED) {
          p.vx = (p.vx / speed) * MAX_SPEED;
          p.vy = (p.vy / speed) * MAX_SPEED;
        }

        p.x += p.vx;
        p.y += p.vy;

        if (p.x < p.r) { p.x = p.r; p.vx = Math.abs(p.vx); }
        else if (p.x > width - p.r) { p.x = width - p.r; p.vx = -Math.abs(p.vx); }
        if (p.y < p.r) { p.y = p.r; p.vy = Math.abs(p.vy); }
        else if (p.y > height - p.r) { p.y = height - p.r; p.vy = -Math.abs(p.vy); }
      }

      const time = t * 0.001;

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i];
          const b = particles[j];
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < LINK_DIST) {
            ctx.strokeStyle = "rgba(160, 170, 255, 1)";
            ctx.globalAlpha = (1 - dist / LINK_DIST) * LINK_ALPHA;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }

          const minDist = a.r + b.r;
          if (dist >= minDist || dist === 0) continue;

          const nx = dx / dist;
          const ny = dy / dist;
          const ma = a.r * a.r;
          const mb = b.r * b.r;
          const total = ma + mb;
          const overlap = minDist - dist;

          a.x -= nx * overlap * (mb / total);
          a.y -= ny * overlap * (mb / total);
          b.x += nx * overlap * (ma / total);
          b.y += ny * overlap * (ma / total);

          const dvx = a.vx - b.vx;
          const dvy = a.vy - b.vy;
          const dot = dvx * nx + dvy * ny;
          if (dot > 0) {
            const jImpulse = (1.9 * dot) / (1 / ma + 1 / mb);
            a.vx -= (jImpulse * nx) / ma;
            a.vy -= (jImpulse * ny) / ma;
            b.vx += (jImpulse * nx) / mb;
            b.vy += (jImpulse * ny) / mb;
          }
        }
      }

      for (const p of particles) {
        const pulse = 0.8 + 0.2 * Math.sin(time * p.pulseRate + p.phase);
        ctx.globalAlpha = p.alpha * pulse;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";

      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none" aria-hidden="true">
      <canvas ref={canvasRef} className="absolute inset-0" />
    </div>
  );
};

export default FeedBackground;
