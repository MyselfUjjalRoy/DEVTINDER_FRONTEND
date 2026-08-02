import { useCallback, useEffect, useState } from "react";
import MediaImage from "./MediaImage";

const AURA_COLORS = ["#ff2d55", "#22d3ee", "#f472b6", "#fbbf24", "#34d399", "#a78bfa"];

const STAR_POS = [
  { top: "10%", left: "8%" },
  { top: "16%", left: "86%" },
  { top: "24%", left: "32%" },
  { top: "30%", left: "70%" },
  { top: "42%", left: "16%" },
  { top: "46%", left: "58%" },
  { top: "58%", left: "88%" },
  { top: "64%", left: "28%" },
  { top: "72%", left: "12%" },
  { top: "78%", left: "62%" },
  { top: "86%", left: "40%" },
  { top: "90%", left: "90%" },
];

const PhotoViewer = ({ photos, index, setIndex, onClose, firstName }) => {
  const [zoomed, setZoomed] = useState(false);
  const total = photos.length;
  const color = AURA_COLORS[index % AURA_COLORS.length];
  const frame = index + 1;

  const prev = useCallback(
    () => setIndex((i) => (i + total - 1) % total),
    [total, setIndex]
  );
  const next = useCallback(
    () => setIndex((i) => (i + 1) % total),
    [total, setIndex]
  );

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowLeft") prev();
      else if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [prev, next, onClose]);

  const toggleZoom = () => setZoomed((z) => !z);

  return (
    <div
      className="holo-backdrop fixed inset-0 z-[80] flex flex-col"
      role="dialog"
      aria-modal="true"
      aria-label={`${firstName}'s photo ${frame} of ${total}`}
      onClick={onClose}
    >
      {/* deep-space backdrop */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {STAR_POS.map((s, i) => (
          <span
            key={i}
            className="holo-star"
            style={{ ...s, animationDelay: `${-(i * 0.8)}s` }}
          />
        ))}
        <div className="absolute inset-0 holo-grain" />
        <div
          className="absolute -top-52 left-1/2 -translate-x-1/2 w-[46rem] h-[46rem] rounded-full blur-3xl transition-colors duration-700"
          style={{ background: `radial-gradient(circle, ${color}2e, transparent 62%)` }}
        />
        <div
          className="absolute -bottom-40 -right-32 w-[30rem] h-[30rem] rounded-full blur-3xl transition-colors duration-700"
          style={{ background: `radial-gradient(circle, ${color}1f, transparent 62%)` }}
        />
      </div>

      {/* top bar */}
      <div className="relative z-10 flex items-center justify-between px-5 sm:px-8 pt-5">
        <div className="flex items-center gap-3">
          <span
            className="inline-block w-2 h-2 rounded-full animate-pulse"
            style={{ background: color, boxShadow: `0 0 10px ${color}` }}
          />
          <p className="text-[11px] font-black uppercase tracking-[0.25em] text-white/80">
            Archive <span className="text-white/40">· {firstName}</span>
          </p>
          <span className="hidden sm:inline font-mono text-[11px] tracking-[0.15em] text-white/40">
            {String(frame).padStart(2, "0")} / {String(total).padStart(2, "0")}
          </span>
        </div>
        <button
          onClick={onClose}
          title="Close (Esc)"
          aria-label="Close viewer"
          className="holo-close group relative flex items-center justify-center w-10 h-10 rounded-full border border-white/20 bg-white/5 hover:bg-white/15 hover:rotate-90 hover:scale-105 hover:border-white/40 transition-all duration-300"
        >
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.4" strokeLinecap="round">
            <path d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* main stage */}
      <div
        className="relative z-10 flex-1 flex items-center justify-center px-4 sm:px-24 py-2 min-h-0"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={prev}
          title="Previous (←)"
          aria-label="Previous photo"
          className="holo-nav left group absolute left-3 sm:left-6 flex items-center justify-center w-11 h-11 rounded-full border border-white/15 bg-white/5 hover:bg-white/15 hover:scale-110 hover:border-white/40 transition-all duration-300"
        >
          <svg className="w-5 h-5 text-white group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <div className="relative max-h-full flex flex-col items-center">
          <span
            className="holo-pedestal-ring absolute -inset-8 sm:-inset-10 pointer-events-none"
            style={{ "--ring-c": color }}
          />
          <span
            className="holo-pedestal-glow absolute inset-6 pointer-events-none"
            style={{ background: `radial-gradient(circle, ${color}40, transparent 70%)` }}
          />

          <div
            key={index}
            className={`holo-flash relative rounded-2xl overflow-hidden border border-white/20 shadow-2xl select-none ${
              zoomed ? "holo-photo-zoomed" : ""
            }`}
            onClick={toggleZoom}
            title={zoomed ? "Click to zoom out" : "Click to zoom in"}
          >
            <MediaImage
              src={photos[index]}
              alt={`${firstName} photo ${frame}`}
              className="holo-photo max-h-[58vh] sm:max-h-[64vh] w-auto max-w-full object-contain"
              draggable={false}
            />
            <span className="holo-scan" />
            <span className="holo-grid" />
            <span className="holo-corner holo-corner--tl" />
            <span className="holo-corner holo-corner--tr" />
            <span className="holo-corner holo-corner--bl" />
            <span className="holo-corner holo-corner--br" />
          </div>

          <p className="mt-4 text-[10px] font-black uppercase tracking-[0.3em] text-white/70">
            {firstName}'s moment <span className="text-white/35">{String(frame).padStart(2, "0")}</span>
          </p>
          <p className="mt-1.5 text-[9px] font-bold uppercase tracking-[0.2em] text-white/30">
            {zoomed ? "click to zoom out" : "click to zoom in"} · ← → navigate · esc close
          </p>
        </div>

        <button
          onClick={next}
          title="Next (→)"
          aria-label="Next photo"
          className="holo-nav right group absolute right-3 sm:right-6 flex items-center justify-center w-11 h-11 rounded-full border border-white/15 bg-white/5 hover:bg-white/15 hover:scale-110 hover:border-white/40 transition-all duration-300"
        >
          <svg className="w-5 h-5 text-white group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* filmstrip thumbnails */}
      <div className="relative z-10 px-4 sm:px-8 pb-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-center gap-2.5 overflow-x-auto holo-thumbrow pb-1">
          {photos.map((p, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              title={`Photo ${i + 1}`}
              className={`holo-thumb relative w-14 h-16 sm:w-16 sm:h-20 rounded-xl overflow-hidden border transition-all duration-300 shrink-0 ${
                i === index ? "active" : ""
              }`}
              style={{ "--thumb-c": AURA_COLORS[i % AURA_COLORS.length] }}
            >
              <MediaImage src={p} alt="" className="w-full h-full object-cover" draggable={false} />
              {i === index && (
                <span
                  className="absolute inset-0 border-2 rounded-xl pointer-events-none"
                  style={{ borderColor: AURA_COLORS[i % AURA_COLORS.length], boxShadow: `0 0 12px ${AURA_COLORS[i % AURA_COLORS.length]}66 inset` }}
                />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PhotoViewer;
