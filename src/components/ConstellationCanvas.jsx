import { useEffect, useRef } from "react";

const COLORS = ["#ff2d55", "#22d3ee", "#fbbf24", "#34d399", "#a78bfa", "#f472b6"];

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
      t += 0.0014;
      ctx.clearRect(0, 0, W, H);

      const targetX = mouse.current.inside ? (mouse.current.x - 0.5) * 90 : 0;
      const targetY = mouse.current.inside ? (mouse.current.y - 0.5) * 60 : 0;
      driftX += (targetX - driftX) * 0.05;
      driftY += (targetY - driftY) * 0.05;

      const cx = W / 2 + driftX;
      const cy = H / 2 + driftY;
      const scale = Math.min(W, H);

      // radar sweep + dashed orbit ring
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(now / 2600);
      ctx.strokeStyle = "rgba(255,255,255,0.05)";
      ctx.setLineDash([5, 16]);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(0, 0, Math.min(W, H) * 0.47, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      const sweepA = (now / 3000) % (Math.PI * 2);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, Math.min(W, H) * 0.47, sweepA - 0.1, sweepA);
      ctx.closePath();
      ctx.fillStyle = "rgba(255,255,255,0.028)";
      ctx.fill();
      ctx.restore();

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

      // links
      for (let i = 0; i < pos.length; i++) {
        const p = pos[i];
        const pulse = 0.25 + 0.2 * Math.sin(now / 1200 + p.phase);
        const focused = i === focus;
        ctx.lineWidth = focused ? 1.6 : 1;
        ctx.strokeStyle = focused
          ? p.color
          : `rgba(255,255,255,${0.12 + pulse * 0.2})`;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();

        const q = pos[(i + 1) % pos.length];
        ctx.strokeStyle = focused
          ? p.color
          : `rgba(255,255,255,${0.05 + pulse * 0.12})`;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(q.x, q.y);
        ctx.stroke();
      }

      // skill nodes + labels
      for (let i = 0; i < pos.length; i++) {
        const p = pos[i];
        const focused = i === focus;
        const twinkle = focused ? 1 : 0.55 + 0.45 * Math.sin(now / 700 + p.tw);
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
        ctx.globalAlpha = focused ? 1 : 0.72 + 0.28 * Math.sin(now / 900 + p.phase);
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
