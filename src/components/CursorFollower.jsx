import { useEffect, useRef } from "react";

const CursorFollower = () => {
  const dotRef = useRef(null);

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dot = dotRef.current;
    if (!fine || reduced || !dot) {
      return undefined;
    }

    document.documentElement.classList.add("cursor-follower-active");

    let mx = window.innerWidth / 2;
    let my = window.innerHeight / 2;
    let shown = false;
    let raf;

    const onMove = (e) => {
      mx = e.clientX;
      my = e.clientY;
      if (!shown) {
        shown = true;
        dot.style.opacity = "1";
      }
    };

    const loop = () => {
      dot.style.transform = `translate3d(${mx}px, ${my}px, 0) translate(-50%, -50%)`;
      raf = requestAnimationFrame(loop);
    };

    const onOver = (e) => {
      const hit = e.target.closest(
        "a, button, input, textarea, [role='button'], [data-magnetic], .tilt-card, .gal-card, .app-nav-track",
      );
      dot.classList.toggle("cursor-follower--hover", Boolean(hit));
    };

    const onLeave = () => {
      shown = false;
      dot.style.opacity = "0";
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mouseover", onOver, { passive: true });
    document.documentElement.addEventListener("mouseleave", onLeave);

    raf = requestAnimationFrame(loop);

    return () => {
      document.documentElement.classList.remove("cursor-follower-active");
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseover", onOver);
      document.documentElement.removeEventListener("mouseleave", onLeave);
      cancelAnimationFrame(raf);
    };
  }, []);

  return <div ref={dotRef} className="cursor-follower cursor-follower-dot" aria-hidden="true" />;
};

export default CursorFollower;
