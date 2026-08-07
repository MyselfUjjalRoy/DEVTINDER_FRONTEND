import { useEffect, useRef } from "react";

const COLORS = ["#ff2d55", "#22d3ee", "#fbbf24", "#34d399", "#a78bfa", "#f472b6"];

const RINGS = [
  { r: 0.16 },
  { r: 0.29 },
  { r: 0.42 },
];

const makeGlow = (color) => {
  const size = 64;
  const c = document.createElement("canvas");
  c.width = size;
  c.height = size;
  const g = c.getContext("2d");
  const grad = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  grad.addColorStop(0, color);
  grad.addColorStop(0.35, color);
  grad.addColorStop(1, "rgba(0,0,0,0)");
  g.fillStyle = grad;
  g.fillRect(0, 0, size, size);
  return c;
};

const rr = (ctx, x, y, w, h, r) => {
  if (typeof ctx.roundRect === "function") {
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, r);
  } else {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }
};

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
    let t = 0;
    let last = 0;
    let visible = true;
    let driftX = 0;
    let driftY = 0;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const glowSprites = {};
    COLORS.forEach((c) => {
      glowSprites[c] = makeGlow(c);
    });

    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
      },
      { threshold: 0.02 },
    );
    io.observe(canvas);

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
      const dt = Math.min((now - last) / 1000, 1 / 30);
      last = now;
      if (!reduce) t += dt * 0.085;
      if (!visible || !W || !H) return;
      const tt = reduce ? 6000 : now;
      ctx.clearRect(0, 0, W, H);

      const idleX = Math.sin(t * 0.5) * 7;
      const idleY = Math.cos(t * 0.33) * 6;
      const targetX = (mouse.current.inside ? (mouse.current.x - 0.5) * 90 : 0) + idleX;
      const targetY = (mouse.current.inside ? (mouse.current.y - 0.5) * 60 : 0) + idleY;
      driftX += (targetX - driftX) * 0.05;
      driftY += (targetY - driftY) * 0.05;

      const cx = W / 2 + driftX;
      const cy = H / 2 + driftY;
      const scale = Math.min(W, H);

      const bg = ctx.createRadialGradient(cx, cy, 0, cx, cy, scale * 0.62);
      bg.addColorStop(0, "rgba(191, 90, 242, 0.08)");
      bg.addColorStop(0.55, "rgba(34, 211, 238, 0.03)");
      bg.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

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
      }
      ctx.restore();

      const pos = nodes.map((n, i) => ({
        ...n,
        x: cx + (n.baseX - 0.5) * scale * 1.05 + Math.sin(t + i) * 5,
        y: cy + (n.baseY - 0.5) * scale * 1.02 + Math.cos(t * 0.7 + i) * 5,
      }));

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
      }

      for (let i = 0; i < pos.length; i++) {
        const p = pos[i];
        const focused = i === focus;
        const twinkle = focused ? 1 : 0.55 + 0.45 * Math.sin(tt / 700 + p.tw);
        const glow = glowSprites[p.color];

        const dx = p.x - cx;
        const dy = p.y - cy;
        const dl = Math.hypot(dx, dy) || 1;
        const nx = dx / dl;
        const ny = dy / dl;
        const lx = p.x + nx * (p.rad + 15);
        const ly = Math.min(Math.max(p.y + ny * (p.rad + 15), 20), H - 20);

        ctx.save();
        ctx.globalAlpha = (0.12 + 0.08 * twinkle) * (focused ? 1.4 : 0.8);
        const halo = p.rad * 3.4 * 6;
        ctx.drawImage(glow, p.x - halo / 2, p.y - halo / 2, halo, halo);
        ctx.restore();

        ctx.save();
        ctx.globalAlpha = focused ? 1 : 0.5 + 0.5 * twinkle;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, focused ? p.rad + 2.5 : p.rad, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        if (focused) {
          ctx.save();
          ctx.globalAlpha = 0.4 + 0.25 * Math.sin(now / 380);
          ctx.strokeStyle = p.color;
          ctx.lineWidth = 1.2;
          ctx.setLineDash([2, 5]);
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.rad + 11, 0, Math.PI * 2);
          ctx.stroke();
          ctx.setLineDash([]);
          ctx.restore();
        }

        ctx.save();
        ctx.globalAlpha = focused ? 1 : 0.45 + 0.18 * Math.sin(tt / 900 + p.phase);
        ctx.font = focused
          ? "800 11px 'Fira Code', ui-monospace, monospace"
          : "700 10px 'Fira Code', ui-monospace, monospace";
        ctx.fillStyle = focused ? p.color : "#cbd5e1";
        ctx.textBaseline = "middle";
        if (Math.abs(nx) > 0.35) {
          ctx.textAlign = nx > 0 ? "left" : "right";
          ctx.fillText(p.skill.toUpperCase(), lx + (nx > 0 ? 6 : -6), ly);
        } else {
          ctx.textAlign = "center";
          ctx.fillText(p.skill.toUpperCase(), lx, ly);
        }
        ctx.restore();
      }

      ctx.save();
      ctx.globalAlpha = 0.75;
      ctx.drawImage(glowSprites["#ff2d55"], cx - 65, cy - 65, 130, 130);
      ctx.restore();

      const cg = ctx.createLinearGradient(cx - 26, cy - 26, cx + 26, cy + 26);
      cg.addColorStop(0, "#ff2d55");
      cg.addColorStop(1, "#bf5af2");
      ctx.fillStyle = cg;
      ctx.beginPath();
      ctx.arc(cx, cy, 24, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#fff";
      ctx.font = "900 13px 'Fira Code', ui-monospace, monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("</>", cx, cy + 1);
      ctx.restore();

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
    };

    draw(0);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener("resize", resize);
      panel.removeEventListener("mousemove", onMove);
      panel.removeEventListener("mouseleave", onLeave);
    };
  }, [skills]);

  if (!skills.length) return null;

  return (
    <canvas
      ref={canvasRef}
      className="block w-full h-[420px] sm:h-[520px] will-change-transform"
      aria-label="Tech stack constellation"
    />
  );
};

export default ConstellationCanvas;
