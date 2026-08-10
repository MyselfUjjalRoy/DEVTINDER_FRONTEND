import { useState } from "react";

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

const MatchBadge = ({ score, breakdown }) => {
  const [open, setOpen] = useState(false);

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
    <div
      className="relative pointer-events-auto"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        title={`${labelForScore(clamped)} — see why`}
        aria-label={`${labelForScore(clamped)} compatibility`}
        aria-expanded={open}
        onClick={(e) => {
          e.stopPropagation();
          setOpen((o) => !o);
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

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 z-50 w-48 rounded-2xl bg-[#171228]/95 backdrop-blur-xl border border-white/10 p-3 shadow-2xl">
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
        </>
      )}
    </div>
  );
};

export default MatchBadge;
