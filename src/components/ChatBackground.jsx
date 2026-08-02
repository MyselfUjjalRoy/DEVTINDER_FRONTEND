import { useEffect, useRef } from "react";

const ChatBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const parent = canvas.parentElement;
    let w = parent.clientWidth;
    let h = parent.clientHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      w = parent.clientWidth;
      h = parent.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const COUNT = 48;
    const dots = Array.from({ length: COUNT }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 2.1 + 0.6,
      vx: (Math.random() - 0.5) * 0.16,
      vy: -(Math.random() * 0.24 + 0.04),
      tw: Math.random() * 1.2 + 0.6,
      phase: Math.random() * Math.PI * 2,
      hue: 250 + Math.random() * 140,
    }));

    let raf;
    const step = (t) => {
      const time = t * 0.001;
      ctx.clearRect(0, 0, w, h);
      for (const p of dots) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < -10) p.x = w + 10;
        if (p.x > w + 10) p.x = -10;
        if (p.y < -10) p.y = h + 10;

        const tw = 0.3 + 0.7 * (0.5 + 0.5 * Math.sin(time * p.tw + p.phase));
        ctx.globalAlpha = tw * 0.5;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `hsl(${p.hue} 90% 78%)`;
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      aria-hidden="true"
    />
  );
};

export default ChatBackground;
