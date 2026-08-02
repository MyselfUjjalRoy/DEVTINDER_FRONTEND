import { useEffect, useRef, useState } from "react";

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const pad = (n) => String(n).padStart(2, "0");
const toISO = (year, month, day) => `${year}-${pad(month + 1)}-${pad(day)}`;
const parseISO = (str) => {
  const [y, m, d] = str.split("-").map(Number);
  return { year: y, month: m - 1, day: d };
};

const formatDisplay = (str) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(str)) return "";
  const { year, month, day } = parseISO(str);
  return new Date(year, month, day).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const CalendarPicker = ({ label, value, onChange, minDate, maxDate }) => {
  const [open, setOpen] = useState(false);
  // "year" -> pick eligible year, "month" -> pick month of that year, "day" -> calendar grid
  const [step, setStep] = useState("year");
  const [viewYear, setViewYear] = useState(null);
  const [viewMonth, setViewMonth] = useState(null);
  const rootRef = useRef(null);

  const today = new Date();
  const todayISO = toISO(today.getFullYear(), today.getMonth(), today.getDate());
  const selected = /^\d{4}-\d{2}-\d{2}$/.test(value || "")
    ? parseISO(value)
    : null;

  const min = minDate ? parseISO(minDate) : { year: 1926, month: 0, day: 1 };
  const max = maxDate ? parseISO(maxDate) : { year: 2011, month: 7, day: 2 };

  // Eligible years, newest first (e.g. 2011 ... 1926)
  const years = [];
  for (let y = max.year; y >= min.year; y--) years.push(y);

  const isMonthEligible = (y, m) => {
    if (y < min.year || y > max.year) return false;
    if (y === min.year && m < min.month) return false;
    if (y === max.year && m > max.month) return false;
    return true;
  };

  useEffect(() => {
    if (!open) return;
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
  }, [open]);

  const openCalendar = () => {
    setViewYear(selected ? selected.year : max.year);
    setViewMonth(selected ? selected.month : max.month);
    setStep(selected ? "day" : "year");
    setOpen(true);
  };

  const goBack = () => {
    if (step === "day") setStep("month");
    else if (step === "month") setStep("year");
  };

  const pickYear = (y) => {
    setViewYear(y);
    setStep("month");
  };

  const pickMonth = (m) => {
    setViewMonth(m);
    setStep("day");
  };

  const moveMonth = (delta) => {
    let y = viewYear;
    let m = viewMonth + delta;
    if (m < 0) {
      m = 11;
      y -= 1;
    }
    if (m > 11) {
      m = 0;
      y += 1;
    }
    if (y < min.year || y > max.year) return;
    if (y === min.year && m < min.month) return;
    if (y === max.year && m > max.month) return;
    setViewYear(y);
    setViewMonth(m);
  };

  const canPrev = isMonthEligible(viewYear - (viewMonth === 0 ? 1 : 0), (viewMonth + 11) % 12);
  const canNext = isMonthEligible(viewYear + (viewMonth === 11 ? 1 : 0), (viewMonth + 1) % 12);

  const pick = (iso) => {
    onChange(iso);
    setOpen(false);
  };

  const title =
    step === "year"
      ? "Select Year"
      : step === "month"
        ? `Pick a month — ${viewYear}`
        : `${MONTHS[viewMonth]} ${viewYear}`;

  // ── DAY GRID (calendar) ──
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstWeekday = new Date(viewYear, viewMonth, 1).getDay();
  const cells = [];
  for (let i = 0; i < firstWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const dayGrid = (
    <>
      <div className="grid grid-cols-7 gap-1">
        {WEEKDAYS.map((wd, i) => (
          <div
            key={wd}
            className="text-center text-[10px] font-black uppercase tracking-wider text-base-content/40 py-1"
          >
            {wd}
          </div>
        ))}
        {cells.map((day, i) => {
          if (day === null) return <div key={`x${i}`} />;
          const iso = toISO(viewYear, viewMonth, day);
          const disabled =
            (minDate && iso < minDate) || (maxDate && iso > maxDate);
          const isToday = iso === todayISO;
          const isSelected = iso === value;
          return (
            <button
              key={iso}
              type="button"
              disabled={disabled}
              onClick={() => pick(iso)}
              className={[
                "h-9 rounded-lg text-[13px] font-bold transition-all duration-150",
                disabled && "text-base-content/20 cursor-not-allowed",
                !disabled && !isSelected && "text-white hover:bg-primary/15 hover:text-primary",
                isSelected && "bg-gradient-to-tr from-primary to-secondary text-white shadow-lg shadow-primary/30 scale-105",
                isToday && !isSelected && "ring-1 ring-primary/50 text-primary",
              ].join(" ")}
            >
              {day}
            </button>
          );
        })}
      </div>
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/10">
        <p className="text-[10px] text-base-content/40">Age must be 15–100</p>
        {value && (
          <button
            type="button"
            onClick={() => {
              onChange("");
              setOpen(false);
            }}
            className="text-[10px] font-black uppercase tracking-wider text-error/80 hover:text-error transition-colors"
          >
            Clear
          </button>
        )}
      </div>
    </>
  );

  return (
    <div className="relative" ref={rootRef}>
      <label className="label py-1">
        <span className="label-text text-[11px] font-bold uppercase tracking-wider text-base-content/70">
          {label}
        </span>
      </label>

      <button
        type="button"
        onClick={openCalendar}
        className="w-full h-11 px-3 rounded-xl bg-base-900/60 border border-white/10 text-left flex items-center justify-between gap-2 focus:outline-none focus:border-primary transition-all hover:border-white/25"
      >
        <span
          className={`text-base sm:text-xs truncate ${
            value ? "text-white" : "text-base-content/30"
          }`}
        >
          {value ? formatDisplay(value) : "Select date"}
        </span>
        <svg
          className="w-4 h-4 shrink-0 text-base-content/40"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-2 z-50 w-[320px] max-w-[85vw] rounded-2xl glass-card shadow-2xl p-4 calendar-pop">
          {/* Header */}
          <div className="flex items-center gap-1 mb-3">
            {step !== "year" ? (
              <button
                type="button"
                onClick={goBack}
                aria-label="Go back"
                className="w-8 h-8 shrink-0 rounded-lg flex items-center justify-center text-base-content/60 hover:text-white hover:bg-white/10 transition-all"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            ) : (
              <span className="w-8 shrink-0" />
            )}

            <div className="flex-1 flex items-center justify-center gap-1">
              {step === "day" && (
                <button
                  type="button"
                  disabled={!canPrev}
                  onClick={() => moveMonth(-1)}
                  aria-label="Previous month"
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-base-content/60 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
              )}
              <button
                type="button"
                onClick={() => step === "day" && setStep("month")}
                className={`text-sm font-black text-white tracking-tight ${
                  step === "day" ? "hover:text-primary cursor-pointer transition-colors" : "cursor-default"
                }`}
              >
                {title}
              </button>
              {step === "day" && (
                <button
                  type="button"
                  disabled={!canNext}
                  onClick={() => moveMonth(1)}
                  aria-label="Next month"
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-base-content/60 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close"
              className="w-8 h-8 shrink-0 rounded-lg flex items-center justify-center text-base-content/60 hover:text-white hover:bg-white/10 transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Year panel */}
          {step === "year" && (
            <div className="grid grid-cols-4 gap-2 max-h-64 overflow-y-auto pr-1">
              {years.map((y) => {
                const isCurrent = selected && selected.year === y;
                return (
                  <button
                    key={y}
                    type="button"
                    onClick={() => pickYear(y)}
                    className={[
                      "h-10 rounded-lg text-sm font-bold transition-all duration-150",
                      isCurrent
                        ? "bg-gradient-to-tr from-primary to-secondary text-white shadow-lg shadow-primary/30"
                        : "text-white bg-white/5 hover:bg-primary/15 hover:text-primary",
                    ].join(" ")}
                  >
                    {y}
                  </button>
                );
              })}
            </div>
          )}

          {/* Month panel */}
          {step === "month" && (
            <div className="grid grid-cols-3 gap-2">
              {MONTHS.map((name, m) => {
                const eligible = isMonthEligible(viewYear, m);
                const isCurrent = selected && selected.year === viewYear && selected.month === m;
                return (
                  <button
                    key={name}
                    type="button"
                    disabled={!eligible}
                    onClick={() => pickMonth(m)}
                    className={[
                      "h-11 rounded-xl text-[13px] font-bold uppercase tracking-wide transition-all duration-150",
                      !eligible && "text-base-content/20 cursor-not-allowed",
                      eligible && !isCurrent && "text-white bg-white/5 hover:bg-primary/15 hover:text-primary",
                      isCurrent && "bg-gradient-to-tr from-primary to-secondary text-white shadow-lg shadow-primary/30",
                    ].join(" ")}
                  >
                    {name.slice(0, 3)}
                  </button>
                );
              })}
            </div>
          )}

          {/* Day panel */}
          {step === "day" && dayGrid}
        </div>
      )}
    </div>
  );
};

export default CalendarPicker;
