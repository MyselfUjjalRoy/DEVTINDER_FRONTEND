import { useState, useRef, useEffect } from "react";

/**
 * MatchBadge — the visible result of the compatibility recommender.
 *
 * Renders a circular progress ring with the candidate's compatibility band
 * (Low / Mid / High — never a raw number) and, on hover/click, a small
 * breakdown popover showing how much each signal (skills, location)
 * contributed.
 *
 * Why bands instead of a percentage? A 0-100 number overclaims: the score
 * measures profile overlap, not chemistry. Banding keeps the ranking math
 * honest while never telling a user someone is a literal "0% match". The
 * per-signal percentages in the popover remain exact so the "why" is
 * quantitative.
 *
 * The popover is rendered with `position: fixed` anchored to the button's
 * bounding rect. The badge lives inside the card's photo `<figure>` which has
 * `overflow-hidden`, so an absolutely-positioned popover would get clipped or
 * covered by the card. Fixed positioning escapes that stacking context
 * entirely.
 *
 * The `score` and `breakdown` fields come straight from the /feed API response.
 * If they're missing (older cached feeds), the badge simply doesn't render.
 */

const RING_BANDS = [
  { min: 70, shortLabel: "High", color: "#34d399", glow: "rgba(52,211,153,0.45)" },   // high
  { min: 40, shortLabel: "Mid", color: "#fbbf24", glow: "rgba(251,191,36,0.45)" },    // medium
  { min: 0, shortLabel: "Low", color: "#fb7185", glow: "rgba(251,113,133,0.45)" },    // low
];

const bandForScore = (score) =>
  RING_BANDS.find((c) => score >= c.min) || RING_BANDS[RING_BANDS.length - 1];

const labelForScore = (score) =>
  score >= 70 ? "High match" : score >= 40 ? "Moderate match" : "Low match";

const POPOVER_WIDTH = 192; // w-48
const POPOVER_HEIGHT = 160; // rough max height, used to flip above the badge
const EDGE_PAD = 8;

const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

const MatchBadge = ({ score, breakdown }) => {
  const [open, setOpen] = useState(false);
  const [anchor, setAnchor] = useState(null);
  const btnRef = useRef(null);
  const popRef = useRef(null);
  const closeTimer = useRef(null);

  // Position the fixed popover just under the badge, clamped to the viewport
  // so it never goes off-screen. Flips above the badge when there is no room
  // below.
  const computeAnchor = () => {
    if (!btnRef.current) return null;
    const r = btnRef.current.getBoundingClientRect();
    const center = r.left + r.width / 2;
    const minLeft = POPOVER_WIDTH / 2 + EDGE_PAD;
    const maxLeft = window.innerWidth - POPOVER_WIDTH / 2 - EDGE_PAD;
    let left = clamp(center, minLeft, maxLeft);
    let top = r.bottom + EDGE_PAD;
    if (top + POPOVER_HEIGHT > window.innerHeight - EDGE_PAD) {
      top = Math.max(EDGE_PAD, r.top - POPOVER_HEIGHT - EDGE_PAD);
    }
    return { top, left };
  };

  const openPop = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setAnchor(computeAnchor());
    setOpen(true);
  };

  // Short delay so moving the cursor between the badge and its popover (they
  // are separate DOM nodes) doesn't blink it closed.
  const scheduleClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpen(false), 150);
  };

  const closeNow = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpen(false);
  };

  useEffect(
    () => () => {
      if (closeTimer.current) clearTimeout(closeTimer.current);
    },
    [],
  );

  // Close when tapping/clicking outside, or when the fixed popover would
  // detach from the badge (scroll / resize).
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e) => {
      const target = e.target;
      if (btnRef.current && btnRef.current.contains(target)) return;
      if (popRef.current && popRef.current.contains(target)) return;
      setOpen(false);
    };
    const onViewportChange = () => setOpen(false);
    document.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("scroll", onViewportChange, true);
    window.addEventListener("resize", onViewportChange);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("scroll", onViewportChange, true);
      window.removeEventListener("resize", onViewportChange);
    };
  }, [open]);

  if (typeof score !== "number" || Number.isNaN(score)) return null;

  const clamped = Math.min(100, Math.max(0, Math.round(score)));
  const band = bandForScore(clamped);
  const { color, glow } = band;

  const radius = 15.5;
  const circumference = 2 * Math.PI * radius;
  const dash = (clamped / 100) * circumference;

  const signals = breakdown
    ? Object.entries(breakdown)
        .filter(([, v]) => v && typeof v.value === "number")
        .map(([key, v]) => ({ key, value: v.value, hasData: v.hasData }))
    : [];

  return (
    <div className="pointer-events-auto">
      <button
        ref={btnRef}
        type="button"
        title={`${labelForScore(clamped)} — see why`}
        aria-label={`${labelForScore(clamped)} compatibility`}
        aria-expanded={open}
        onMouseEnter={openPop}
        onMouseLeave={scheduleClose}
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          if (open) closeNow();
          else openPop();
        }}
        onMouseDown={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
        className="flex items-center justify-center w-[2.5rem] h-[2.5rem] rounded-full bg-black/55 backdrop-blur-md border border-white/15 shadow-lg hover:scale-110 active:scale-95 transition-transform"
        style={{ boxShadow: `0 0 14px ${glow}` }}
      >
        <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 40 40" aria-hidden="true">
          <circle cx="20" cy="20" r={radius} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="3.5" />
          <circle
            cx="20"
            cy="20"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeDasharray={`${dash} ${circumference}`}
          />
        </svg>
        <span className="relative text-[9px] font-black leading-none drop-shadow" style={{ color }}>
          {band.shortLabel}
        </span>
      </button>

      {open && anchor && (
        <div
          ref={popRef}
          className="fixed z-[60] w-48 -translate-x-1/2 rounded-2xl bg-[#171228]/95 backdrop-blur-xl border border-white/10 p-3 shadow-2xl"
          style={{ top: anchor.top, left: anchor.left }}
          onMouseEnter={openPop}
          onMouseLeave={scheduleClose}
        >
          <p className="text-[10px] font-black uppercase tracking-widest" style={{ color }}>
            {labelForScore(clamped)}
          </p>
          {signals.length > 0 ? (
            <ul className="mt-2 space-y-1.5">
              {signals.map((signal) => (
                <li key={signal.key} className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-bold text-white/60 capitalize">
                    {signal.key}
                  </span>
                  <span className="text-[11px] font-black text-white">
                    {signal.value}%{signal.hasData ? "" : "*"}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-1 text-[10px] text-white/50">Not enough profile data yet.</p>
          )}
          <p className="mt-2 text-[9px] text-white/35 leading-snug">
            {signals.some((s) => !s.hasData)
              ? "* based on available profile data"
              : "Skills & location similarity"}
          </p>
        </div>
      )}
    </div>
  );
};

export default MatchBadge;
