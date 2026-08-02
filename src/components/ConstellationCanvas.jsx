import { useEffect, useRef } from "react";

const COLORS = ["#ff2d55", "#22d3ee", "#fbbf24", "#34d399", "#a78bfa", "#f472b6"];

const ConstellationCanvas = ({ skills }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !skills.length) return;
    const ctx = canvas.getContext("2d");
    let raf;
    let W = 0;
    let H = 0;
    let shooting = null;
    let t = 0;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const nodes = skills.map((skill, i) => {
      const angle = (i / skills.length) * Math.PI * 2 + 0.6;
      const r = 0.3 + ((i * 37) % 9) / 32;
      return {
        skill,
        baseX: 0.5 + Math.cos(angle) * r,
        baseY: 0.5 + Math.sin(angle) * r * 0.86,
        rad: 2.2 + (i % 3),
        color: COLORS[i % COLORS.length],
        tw: (i * 0.7) % 4,
        phase: (i * 1.3) % 6,
      };
    });

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = rect.width;
      H = rect.height;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const draw = (now) => {
      raf = requestAnimationFrame(draw);
      t += 0.0014;
      ctx.clearRect(0, 0, W, H);

      const cx = W / 2;
      const cy = H / 2;
      const scale = Math.min(W, H);

      // ambient starfield
      for (let i = 0; i < 46; i++) {
        const sx = (i * 61) % W;
        const sy = (i * 97) % H;
        const a = 0.06 + 0.1 * Math.sin(now / 900 + i * 1.7);
        ctx.fillStyle = `rgba(255,255,255,${a})`;
        ctx.fillRect(sx, sy, 1.4, 1.4);
      }

      const pos = nodes.map((n, i) => ({
        ...n,
        x: cx + (n.baseX - 0.5) * scale * 1.05 + Math.sin(t + i) * 5,
        y: cy + (n.baseY - 0.5) * scale * 1.02 + Math.cos(t * 0.7 + i) * 5,
      }));

      // links
      for (let i = 0; i < pos.length; i++) {
        const p = pos[i];
        const pulse = 0.25 + 0.2 * Math.sin(now / 1200 + p.phase);
        ctx.lineWidth = 1;
        ctx.strokeStyle = `rgba(255,255,255,${0.12 + pulse * 0.2})`;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();

        const q = pos[(i + 1) % pos.length];
        ctx.strokeStyle = `rgba(255,255,255,${0.05 + pulse * 0.12})`;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(q.x, q.y);
        ctx.stroke();
      }

      // skill nodes + labels
      for (const p of pos) {
        const twinkle = 0.55 + 0.45 * Math.sin(now / 700 + p.tw);
        ctx.save();
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 12 * twinkle;
        ctx.fillStyle = p.color;
        ctx.globalAlpha = 0.5 + 0.5 * twinkle;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.rad, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        ctx.save();
        ctx.globalAlpha = 0.72 + 0.28 * Math.sin(now / 900 + p.phase);
        ctx.fillStyle = "#e2e8f0";
        ctx.font = "700 12px 'Fira Code', ui-monospace, SFMono-Regular, monospace";
        ctx.textAlign = "center";
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 10;
        ctx.fillText(p.skill, p.x, p.y - p.rad - 8);
        ctx.restore();
      }

      // core
      ctx.save();
      const cg = ctx.createLinearGradient(cx - 26, cy - 26, cx + 26, cy + 26);
      cg.addColorStop(0, "#ff2d55");
      cg.addColorStop(1, "#bf5af2");
      ctx.shadowColor = "#ff2d55";
      ctx.shadowBlur = 26;
      ctx.fillStyle = cg;
      ctx.beginPath();
      ctx.arc(cx, cy, 24, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = "#fff";
      ctx.font = "900 13px 'Fira Code', ui-monospace, monospace";
      ctx.textAlign = "center";
      ctx.fillText("</>", cx, cy + 4);
      ctx.restore();

      // shooting star
      if (!reduce && Math.random() < 0.004) {
        shooting = {
          x: Math.random() * W,
          y: Math.random() * H * 0.4,
          vx: 3 + Math.random() * 3,
          vy: 1.5 + Math.random() * 2,
          life: 60,
        };
      }
      if (shooting) {
        shooting.x += shooting.vx;
        shooting.y += shooting.vy;
        shooting.life -= 1;
        const a = Math.max(Math.min(shooting.life / 20, 0.9), 0);
        ctx.strokeStyle = `rgba(255,255,255,${a})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(shooting.x, shooting.y);
        ctx.lineTo(shooting.x - shooting.vx * 6, shooting.y - shooting.vy * 6);
        ctx.stroke();
        if (shooting.life <= 0) shooting = null;
      }
    };

    draw(0);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [skills]);

  if (!skills.length) return null;

  return (
    <canvas
      ref={canvasRef}
      className="block w-full h-[420px] sm:h-[520px]"
      aria-label="Tech stack constellation"
    />
  );
};

export default ConstellationCanvas;
