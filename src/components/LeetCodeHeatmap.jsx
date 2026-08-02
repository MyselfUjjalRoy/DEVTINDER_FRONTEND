import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { BASE_URL, getProfileLink } from "../utils/constants";

export const extractLeetcodeUsername = (raw) => {
  if (!raw) return null;
  const value = String(raw).trim().replace(/\/+$/, "");
  if (!value) return null;
  if (/^https?:\/\//i.test(value) || /leetcode\.com/i.test(value)) {
    const match =
      value.match(/leetcode\.com\/u\/([A-Za-z0-9_\-]+)/i) ||
      value.match(/leetcode\.com\/(?:profile\/)?([A-Za-z0-9_\-]+)/i);
    return match ? match[1] : null;
  }
  return value;
};

const CELL = 11;
const GAP = 3;
const PITCH = CELL + GAP;
const COLUMNS = 53;

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const WEEKDAY_ROWS = [
  { row: 1, label: "Mon" },
  { row: 3, label: "Wed" },
  { row: 5, label: "Fri" },
];

const LEVEL_COLORS = [
  "rgba(255,255,255,0.07)",
  "rgba(16,185,129,0.25)",
  "rgba(16,185,129,0.5)",
  "rgba(16,185,129,0.75)",
  "#34d399",
];

const levelFor = (count) => {
  if (!count) return 0;
  if (count <= 2) return 1;
  if (count <= 5) return 2;
  if (count <= 9) return 3;
  return 4;
};

const buildGrid = (calendarMap) => {
  const end = new Date();
  end.setUTCHours(0, 0, 0, 0);

  const start = new Date(end.getTime() - (COLUMNS * 7 - 1) * 86400000);
  start.setUTCDate(start.getUTCDate() - start.getUTCDay());

  const weeks = [];
  let week = [];
  let cursor = new Date(start);
  while (weeks.length < COLUMNS) {
    const ts = Math.floor(cursor.getTime() / 1000);
    week.push({
      date: new Date(cursor),
      count: calendarMap.get(String(ts)) || 0,
    });
    if (week.length === 7) {
      weeks.push(week);
      week = [];
    }
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  const monthLabels = [];
  let lastLabel = null;
  weeks.forEach((week, col) => {
    const month = week[0].date.getUTCMonth();
    if (month !== lastLabel) {
      monthLabels.push({ col, name: MONTHS[month] });
      lastLabel = month;
    }
  });

  return { weeks, monthLabels };
};

const StatPill = ({ icon, label, value, accent = "#ff2d55" }) => (
  <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-white/10 bg-white/5 min-w-[92px]">
    <span className="text-base leading-none" style={{ color: accent }}>
      {icon}
    </span>
    <div className="leading-tight">
      <p className="text-base font-black text-white tabular-nums">{value}</p>
      <p className="text-[8px] font-bold uppercase tracking-widest text-base-content/50">{label}</p>
    </div>
  </div>
);

const LeetCodeHeatmap = ({ userId, username }) => {
  const [status, setStatus] = useState("loading");
  const [errorMsg, setErrorMsg] = useState("");
  const [stats, setStats] = useState(null);

  useEffect(() => {
    let active = true;
    setStatus("loading");
    setErrorMsg("");
    setStats(null);

    (async () => {
      try {
        const res = await axios.get(BASE_URL + `user/${userId}/leetcode-stats`, {
          withCredentials: true,
        });
        if (!active) return;
        setStats(res.data?.data || null);
        setStatus("ok");
      } catch (err) {
        if (!active) return;
        setErrorMsg(
          err?.response?.data?.message ||
            "Could not load LeetCode activity right now.",
        );
        setStatus("error");
      }
    })();

    return () => {
      active = false;
    };
  }, [userId]);

  const calendarMap = useMemo(() => {
    if (!stats?.submissionCalendar) return new Map();
    try {
      return new Map(Object.entries(JSON.parse(stats.submissionCalendar)));
    } catch {
      return new Map();
    }
  }, [stats]);

  const { weeks, monthLabels } = useMemo(
    () => buildGrid(calendarMap),
    [calendarMap],
  );

  const profileLink = getProfileLink(username, "leetcode");
  const todayStr = useMemo(() => {
    const d = new Date();
    d.setUTCHours(0, 0, 0, 0);
    return d.toISOString().slice(0, 10);
  }, []);

  return (
    <div className="glass-panel relative overflow-hidden rounded-2xl p-5 sm:p-6">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
      <div className="absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-primary/10 to-transparent pointer-events-none" />

      <div className="relative flex flex-wrap items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-2.5">
          <span className="w-8 h-8 rounded-xl bg-[#FFA116]/15 border border-[#FFA116]/30 flex items-center justify-center text-lg">
            🧩
          </span>
          <div>
            <p className="text-sm font-black text-white flex items-center gap-2">
              LeetCode Signal
              <span className="font-mono text-[9px] tracking-[0.25em] text-[#FFA116]">
                {username}
              </span>
            </p>
            <p className="text-[10px] text-base-content/50">Daily submission heatmap — last {COLUMNS} weeks</p>
          </div>
        </div>
        {profileLink && (
          <a
            href={profileLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#FFA116]/15 border border-[#FFA116]/30 text-[#FFA116] text-[10px] font-black uppercase tracking-widest hover:bg-[#FFA116]/25 transition-all"
          >
            View profile
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        )}
      </div>

      {status === "loading" && (
        <div className="flex flex-col gap-3">
          <div className="animate-pulse h-3 w-40 rounded bg-white/10" />
          <div className="animate-pulse h-28 rounded-xl bg-white/5" />
        </div>
      )}

      {status === "error" && (
        <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
          <span className="text-2xl opacity-50">📡</span>
          <p className="text-xs font-bold text-base-content/60">{errorMsg}</p>
          <p className="text-[10px] text-base-content/35">Check the LeetCode username on their profile, or try again later.</p>
        </div>
      )}

      {status === "ok" && (
        <div className="relative">
          <div className="relative h-3.5 mb-1.5" style={{ paddingLeft: 18 }}>
            {monthLabels.map((m) => (
              <span
                key={m.col}
                className="absolute top-0 text-[9px] font-bold text-base-content/40"
                style={{ left: 18 + m.col * PITCH }}
              >
                {m.name}
              </span>
            ))}
          </div>

          <div className="overflow-x-auto pb-1">
            <div className="inline-flex gap-[3px]" style={{ minWidth: "max-content" }}>
              <div className="relative" style={{ width: 18 }}>
                {WEEKDAY_ROWS.map((w) => (
                  <span
                    key={w.label}
                    className="absolute right-1 text-[8px] font-bold text-base-content/35"
                    style={{ top: w.row * PITCH - 3 }}
                  >
                    {w.label}
                  </span>
                ))}
              </div>
              {weeks.map((week, ci) => (
                <div key={ci} className="flex flex-col gap-[3px]">
                  {week.map((d, ri) => {
                    const level = levelFor(d.count);
                    const isToday = d.date.toISOString().slice(0, 10) === todayStr;
                    return (
                      <div
                        key={ri}
                        title={`${d.date.toISOString().slice(0, 10)} · ${d.count} submission${d.count === 1 ? "" : "s"}`}
                        style={{
                          width: CELL,
                          height: CELL,
                          borderRadius: 3,
                          background: LEVEL_COLORS[level],
                          boxShadow:
                            level > 0
                              ? `0 0 6px ${LEVEL_COLORS[level]}55`
                              : "none",
                          outline: isToday ? "1px solid rgba(255,255,255,0.5)" : "none",
                        }}
                        className="transition-colors duration-200 hover:scale-110"
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-3 mt-4">
            <StatPill icon="🔥" label="Current streak" value={`${stats.streak}d`} accent="#fb923c" />
            <StatPill icon="⚡" label="Active days" value={stats.totalActiveDays} accent="#34d399" />
            <StatPill icon="✅" label="Solved" value={stats.solved?.total ?? 0} accent="#a3e635" />
            <div className="flex items-center gap-1.5">
              {["easy", "medium", "hard"].map((d) => (
                <span
                  key={d}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-lg border border-white/10 bg-white/5 text-[9px] font-black uppercase tracking-wider"
                  style={{ color: d === "easy" ? "#4ade80" : d === "medium" ? "#facc15" : "#f87171" }}
                >
                  {stats.solved?.[d] ?? 0} {d[0]}
                </span>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-1.5 mt-4 justify-end text-[9px] font-bold text-base-content/40 uppercase tracking-wider">
            Less
            {LEVEL_COLORS.map((c, i) => (
              <span key={i} className="inline-block rounded-[3px]" style={{ width: CELL, height: CELL, background: c }} />
            ))}
            More
          </div>
        </div>
      )}
    </div>
  );
};

export default LeetCodeHeatmap;
