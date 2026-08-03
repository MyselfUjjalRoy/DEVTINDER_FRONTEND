import { useEffect, useRef } from "react";

const COLORS = ["#ff2d55", "#22d3ee", "#fbbf24", "#34d399", "#a78bfa", "#f472b6"];

const RINGS = [
  { r: 0.16, speed: 0.35, sats: 4 },
  { r: 0.29, speed: -0.28, sats: 5 },
  { r: 0.42, speed: 0.2, sats: 6 },
];

const ConstellationCanvas = ({ skills }) => {
  const canvasRef = useRef(null);
  const mouse = useRef({ x: 0.5, y: 0.5, inside: false });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !skills.length) return;
    const ctx = canvas.getContext("2d");
    const panel = canvas.parentElement;
    let raf;
    let W = 0;
    let H = 0;
    let shooting = null;
    let t = 0;
    let driftX = 0;
    let driftY = 0;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const onMove = (e) => {
      const r = canvas.getBoundingClientRect();
      mouse.current.x = (e.clientX - r.left) / r.width;
      mouse.current.y = (e.clientY - r.top) / r.height;
      mouse.current.inside = true;
    };
    const onLeave = () => {
      mouse.current.inside = false;
    };
    panel.addEventListener("mousemove", onMove);
    panel.addEventListener("mouseleave", onLeave);

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
      if (!reduce) t += 0.0014;
      const tt = reduce ? 6000 : now;
      ctx.clearRect(0, 0, W, H);

      const targetX = mouse.current.inside ? (mouse.current.x - 0.5) * 90 : 0;
      const targetY = mouse.current.inside ? (mouse.current.y - 0.5) * 60 : 0;
      driftX += (targetX - driftX) * 0.05;
      driftY += (targetY - driftY) * 0.05;

      const cx = W / 2 + driftX;
      const cy = H / 2 + driftY;
      const scale = Math.min(W, H);

      // faint radial glow behind the whole map
      const bg = ctx.createRadialGradient(cx, cy, 0, cx, cy, scale * 0.62);
      bg.addColorStop(0, "rgba(191, 90, 242, 0.08)");
      bg.addColorStop(0.55, "rgba(34, 211, 238, 0.03)");
      bg.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      // concentric orbit rings with orbiting satellites
      ctx.save();
      ctx.translate(cx, cy);
      for (let ri = 0; ri < RINGS.length; ri++) {
        const ring = RINGS[ri];
        const R = ring.r * scale;
        ctx.strokeStyle = "rgba(255,255,255,0.05)";
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 10]);
        ctx.beginPath();
        ctx.arc(0, 0, R, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
        const spin = (tt / 16000) * ring.speed;
        for (let s = 0; s < ring.sats; s++) {
          const a = spin + (s / ring.sats) * Math.PI * 2;
          const sx = Math.cos(a) * R;
          const sy = Math.sin(a) * R;
          const col = COLORS[(ri * 2 + s) % COLORS.length];
          ctx.save();
          ctx.globalAlpha = 0.55 + 0.45 * Math.sin(tt / 500 + s * 2);
          ctx.shadowColor = col;
          ctx.shadowBlur = 8;
          ctx.fillStyle = col;
          ctx.beginPath();
          ctx.arc(sx, sy, 1.8, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      }
      ctx.restore();

      // ambient starfield
      for (let i = 0; i < 46; i++) {
        const sx = (i * 61) % W;
        const sy = (i * 97) % H;
        const a = reduce ? 0.12 : 0.06 + 0.1 * Math.sin(tt / 900 + i * 1.7);
        ctx.fillStyle = `rgba(255,255,255,${a})`;
        ctx.fillRect(sx, sy, 1.4, 1.4);
      }

      const pos = nodes.map((n, i) => ({
        ...n,
        x: cx + (n.baseX - 0.5) * scale * 1.05 + Math.sin(t + i) * 5,
        y: cy + (n.baseY - 0.5) * scale * 1.02 + Math.cos(t * 0.7 + i) * 5,
      }));

      // hover focus — nearest node to cursor
      let focus = -1;
      let fd = Infinity;
      if (mouse.current.inside) {
        const mx = mouse.current.x * W;
        const my = mouse.current.y * H;
        for (let i = 0; i < pos.length; i++) {
          const d = (pos[i].x - mx) ** 2 + (pos[i].y - my) ** 2;
          if (d < fd) {
            fd = d;
            focus = i;
          }
        }
        if (fd > 52 * 52) focus = -1;
      }

      // proximity particle web between close nodes
      for (let i = 0; i < pos.length; i++) {
        for (let j = i + 1; j < pos.length; j++) {
          const dx = pos[i].x - pos[j].x;
          const dy = pos[i].y - pos[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < scale * 0.26) {
            const k = 1 - d / (scale * 0.26);
            ctx.strokeStyle = `rgba(255,255,255,${0.05 + k * 0.1})`;
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(pos[i].x, pos[i].y);
            ctx.lineTo(pos[j].x, pos[j].y);
            ctx.stroke();
          }
        }
      }

      // core links + traveling energy pulses
      for (let i = 0; i < pos.length; i++) {
        const p = pos[i];
        const pulse = 0.25 + 0.2 * Math.sin(tt / 1200 + p.phase);
        const focused = i === focus;
        ctx.lineWidth = focused ? 1.6 : 1;
        ctx.strokeStyle = focused ? p.color : `rgba(255,255,255,${0.12 + pulse * 0.2})`;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();

        const q = pos[(i + 1) % pos.length];
        ctx.strokeStyle = focused ? p.color : `rgba(255,255,255,${0.05 + pulse * 0.12})`;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(q.x, q.y);
        ctx.stroke();

        if (!reduce) {
          const pr = (now / 2600 + p.phase) % 1;
          if (pr > 0.06) {
            const px = cx + (p.x - cx) * pr;
            const py = cy + (p.y - cy) * pr;
            ctx.save();
            ctx.globalAlpha = (1 - pr) * 0.7;
            ctx.shadowColor = p.color;
            ctx.shadowBlur = 8;
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(px, py, 1.8, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          }
        }
      }

      // skill nodes + labels
      for (let i = 0; i < pos.length; i++) {
        const p = pos[i];
        const focused = i === focus;
        const twinkle = focused ? 1 : 0.55 + 0.45 * Math.sin(tt / 700 + p.tw);

        ctx.save();
        ctx.globalAlpha = 0.12 + 0.08 * twinkle;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.rad * 3.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        ctx.save();
        ctx.shadowColor = p.color;
        ctx.shadowBlur = focused ? 26 : 12 * twinkle;
        ctx.fillStyle = p.color;
        ctx.globalAlpha = focused ? 1 : 0.5 + 0.5 * twinkle;
        ctx.beginPath();
        ctx.arc(p.x, p.y, focused ? p.rad + 2 : p.rad, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        if (focused) {
          ctx.save();
          ctx.globalAlpha = 0.55 + 0.3 * Math.sin(now / 400);
          ctx.strokeStyle = p.color;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.rad + 12, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        }

        ctx.save();
        ctx.globalAlpha = focused ? 1 : 0.72 + 0.28 * Math.sin(tt / 900 + p.phase);
        ctx.fillStyle = focused ? "#ffffff" : "#e2e8f0";
        ctx.font = focused
          ? "900 13px 'Fira Code', ui-monospace, SFMono-Regular, monospace"
          : "700 12px 'Fira Code', ui-monospace, SFMono-Regular, monospace";
        ctx.textAlign = "center";
        ctx.shadowColor = p.color;
        ctx.shadowBlur = focused ? 16 : 10;
        ctx.fillText(p.skill, p.x, p.y - p.rad - 8);
        ctx.restore();
      }

      // core
      const cg = ctx.createLinearGradient(cx - 26, cy - 26, cx + 26, cy + 26);
      cg.addColorStop(0, "#ff2d55");
      cg.addColorStop(1, "#bf5af2");
      ctx.save();
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

      // pulsing rings around the core
      if (!reduce) {
        const corePulse = 0.5 + 0.5 * Math.sin(now / 900);
        ctx.save();
        ctx.strokeStyle = `rgba(255,45,85,${0.18 + corePulse * 0.25})`;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(cx, cy, 30 + corePulse * 8, 0, Math.PI * 2);
        ctx.stroke();
        ctx.strokeStyle = `rgba(34,211,238,${0.15 + corePulse * 0.2})`;
        ctx.beginPath();
        ctx.arc(cx, cy, 38 + corePulse * 6, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

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
      panel.removeEventListener("mousemove", onMove);
      panel.removeEventListener("mouseleave", onLeave);
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
