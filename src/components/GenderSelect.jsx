import { useEffect, useRef, useState } from "react";

const GENDERS = [
  {
    value: "Male",
    glyph: "♂",
    tint: "from-sky-400 to-blue-600",
    chipText: "text-white",
  },
  {
    value: "Female",
    glyph: "♀",
    tint: "from-pink-400 to-rose-600",
    chipText: "text-white",
  },
  {
    value: "Others",
    glyph: "⚧",
    tint: "from-violet-400 to-purple-600",
    chipText: "text-white",
  },
];

const GenderSelect = ({ value, onChange }) => {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const rootRef = useRef(null);
  const selected = GENDERS.find((g) => g.value === value) || null;

  useEffect(() => {
    if (!open) return;
    setActive(Math.max(0, GENDERS.findIndex((g) => g.value === value)));
    const onDocClick = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, value]);

  const move = (dir) =>
    setActive((a) => Math.min(GENDERS.length - 1, Math.max(0, a + dir)));

  const select = (g) => {
    onChange(g.value);
    setOpen(false);
  };

  return (
    <div className="relative" ref={rootRef}>
      <label className="label py-1">
        <span className="label-text text-[11px] font-bold uppercase tracking-wider text-base-content/70">
          Gender
        </span>
      </label>

      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setOpen(true);
            move(1);
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setOpen(true);
            move(-1);
          } else if (e.key === "Enter") {
            e.preventDefault();
            if (open) select(GENDERS[active]);
            else setOpen(true);
          }
        }}
        className={`w-full h-11 px-3 rounded-xl bg-base-900/60 border text-left flex items-center justify-between gap-2 focus:outline-none transition-all ${
          open
            ? "border-primary/60 shadow-lg shadow-primary/10"
            : "border-white/10 hover:border-white/25"
        }`}
      >
        <span
          className={`flex items-center gap-2.5 text-base sm:text-xs truncate ${
            value ? "text-white" : "text-base-content/30"
          }`}
        >
          {selected ? (
            <>
              <span
                className={`w-6 h-6 shrink-0 rounded-lg bg-gradient-to-tr ${selected.tint} flex items-center justify-center text-[12px] font-black shadow-md`}
              >
                {selected.glyph}
              </span>
              {selected.value}
            </>
          ) : (
            "Select gender"
          )}
        </span>
        <svg
          className={`w-4 h-4 shrink-0 text-base-content/40 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute top-full left-0 mt-2 z-50 w-full min-w-[220px] rounded-2xl glass-card shadow-2xl p-2 dropdown-pop"
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              move(1);
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              move(-1);
            } else if (e.key === "Enter") {
              select(GENDERS[active]);
            }
          }}
        >
          {GENDERS.map((g, i) => {
            const isActive = i === active;
            const isSelected = g.value === value;
            return (
              <button
                key={g.value}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => select(g)}
                onMouseEnter={() => setActive(i)}
                className={`w-full flex items-center gap-3 px-3 h-11 rounded-xl text-sm font-bold transition-all duration-150 ${
                  isSelected
                    ? "bg-primary/15 text-primary"
                    : isActive
                      ? "bg-white/5 text-white"
                      : "text-base-content/70 hover:bg-white/5 hover:text-white"
                }`}
              >
                <span
                  className={`w-6 h-6 shrink-0 rounded-lg bg-gradient-to-tr ${g.tint} flex items-center justify-center text-[12px] font-black shadow-md transition-transform duration-150 ${
                    isActive ? "scale-110" : ""
                  }`}
                >
                  {g.glyph}
                </span>
                <span className="flex-1 text-left">{g.value}</span>
                {isSelected && (
                  <svg
                    className="w-4 h-4 text-primary animate-pop-check"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="3"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default GenderSelect;
