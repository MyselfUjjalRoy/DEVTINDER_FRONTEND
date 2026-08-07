import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { BASE_URL, getProfileLink, resolveMediaUrl } from "../utils/constants";
import {
  PlatformIcon,
  BRAND_COLORS,
  LINK_LABELS,
  CODING_PLATFORMS,
} from "../utils/profileLinks";
import { MembershipBadge } from "../utils/membershipUtils";
import MediaImage from "./MediaImage";
import ConstellationCanvas from "./ConstellationCanvas";
import PhotoViewer from "./PhotoViewer";
import Magnetic from "./Magnetic";
import TiltCard from "./TiltCard";
import CharReveal from "./CharReveal";
import CircularBadge from "./CircularBadge";
import Marquee from "./Marquee";

const GENDER_GLYPH = {
  Male: { symbol: "♂", cls: "border-sky-400/40 bg-sky-500/15 text-sky-300" },
  Female: { symbol: "♀", cls: "border-pink-400/40 bg-pink-500/15 text-pink-300" },
  Others: { symbol: "⚧", cls: "border-violet-400/40 bg-violet-500/15 text-violet-300" },
};

const PHOTO_ACCENTS = ["#ff2d55", "#22d3ee", "#f472b6", "#fbbf24", "#34d399", "#a78bfa"];

const RELATION_META = {
  self: { label: "This is you", cls: "border-white/15 bg-white/5 text-slate-200" },
  connection: { label: "Connected", cls: "border-emerald-400/30 bg-emerald-500/10 text-emerald-300" },
  received_request: { label: "Wants to connect", cls: "border-amber-400/30 bg-amber-500/10 text-amber-300" },
  sent_request: { label: "Request sent", cls: "border-sky-400/30 bg-sky-500/10 text-sky-300" },
  stranger: { label: "Not connected yet", cls: "border-white/15 bg-white/5 text-slate-300" },
  ignored: { label: "Passed", cls: "border-white/15 bg-white/5 text-slate-400" },
};

const ZODIAC_CUTS = [
  [120, "♑ Capricorn"],
  [219, "♒ Aquarius"],
  [320, "♓ Pisces"],
  [419, "♈ Aries"],
  [520, "♉ Taurus"],
  [620, "♊ Gemini"],
  [722, "♋ Cancer"],
  [822, "♌ Leo"],
  [922, "♍ Virgo"],
  [1022, "♎ Libra"],
  [1121, "♏ Scorpio"],
  [1221, "♐ Sagittarius"],
  [1231, "♑ Capricorn"],
];

const zodiacFromDob = (dob) => {
  if (!dob || !/^\d{4}-\d{2}-\d{2}$/.test(dob)) return null;
  const n = +dob.slice(5, 7) * 100 + +dob.slice(8, 10);
  return (ZODIAC_CUTS.find(([cut]) => n <= cut) || [0, null])[1];
};

const careerLevel = (years) => {
  if (!years || years <= 0) return null;
  if (years < 2) return "Fresher";
  if (years < 4) return "Junior";
  if (years < 7) return "Mid-level";
  if (years < 11) return "Senior";
  return "Principal / Lead";
};

const CountUp = ({ to, duration = 1000, start = true }) => {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!start) return undefined;
    let raf;
    const t0 = performance.now();
    const tick = (now) => {
      const p = Math.min((now - t0) / duration, 1);
      setVal(Math.round(to * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [to, duration, start]);
  return <>{val}</>;
};

const useProgress = (end, duration = 1500, start = true) => {
  const [p, setP] = useState(0);
  useEffect(() => {
    if (!start) return undefined;
    let raf;
    const t0 = performance.now();
    const tick = (now) => {
      const t = Math.min((now - t0) / duration, 1);
      setP(end * (1 - Math.pow(1 - t, 3)));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [end, duration, start]);
  return p;
};

const useInView = (ref, once = true) => {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          if (once) io.disconnect();
        } else if (!once) {
          setInView(false);
        }
      },
      { threshold: 0.3 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref, once]);
  return inView;
};

const StatCell = ({ label, accent = "#ff2d55", sub, target = 1, delay = 0, to = 0, unit, icon }) => {
  const [started, setStarted] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setStarted(true), delay);
    return () => clearTimeout(t);
  }, [delay]);
  const prog = useProgress(target, 1500, started);
  const pct = Math.min(Math.max(prog, 0), 1);
  return (
    <div className="app-stat" style={{ "--d": `${delay}ms`, "--sa": accent, "--sa-soft": `${accent}22` }}>
      {icon && <span className="app-stat-icon">{icon}</span>}
      <div className="app-stat-value">
        <CountUp to={to} start={started} />
        {unit && <span className="app-stat-unit">{unit}</span>}
      </div>
      <p className="app-stat-label">{label}</p>
      {sub && <p className="app-stat-sub">{sub}</p>}
      <span className="app-stat-line" style={{ transform: `scaleX(${pct})` }} aria-hidden="true" />
    </div>
  );
};

const WordReveal = ({ text }) => {
  const ref = useRef(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setOn(true);
          io.disconnect();
        }
      },
      { threshold: 0.25 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const words = text.split(" ");
  return (
    <div ref={ref} className={`quote-body${on ? " on" : ""}`}>
      <span className="quote-mark quote-mark-open" aria-hidden="true">“</span>
      <p className="quote-words">
        {words.map((w, i) => (
          <span key={i} className="quote-word" style={{ "--wd": `${i * 26}ms` }}>{w}</span>
        ))}
        <span className="quote-mark quote-mark-close" aria-hidden="true">”</span>
      </p>
      <span className="quote-underline" aria-hidden="true" />
    </div>
  );
};

const Reveal = ({ children, className = "", variant = "up", delay = 0 }) => {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("in");
          io.disconnect();
        }
      },
      { threshold: 0.12 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className={`reveal reveal-${variant} ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
};

const RAIL_COLORS = ["#fbbf24", "#fb7185", "#e879f9", "#c084fc", "#22d3ee", "#34d399"];

const HEADING_THEMES = {
  1: ["#ff2d55", "#f472b6"],
  2: ["#a78bfa", "#22d3ee"],
  3: ["#34d399", "#22d3ee"],
  4: ["#fbbf24", "#ff2d55"],
  5: ["#22d3ee", "#a78bfa"],
  6: ["#bf5af2", "#ff2d55"],
};

const SectionHeader = ({ index, title, subtitle }) => {
  const theme = HEADING_THEMES[index] || HEADING_THEMES[1];
  return (
    <div className="app-sec-head" style={{ "--h1": theme[0], "--h2": theme[1] }}>
      <div className="app-sec-head-row">
        <span className="app-sec-index">0{index}</span>
        <span className="app-sec-line" aria-hidden="true" />
      </div>
      <h2 className="app-sec-title">{title}</h2>
      {subtitle && <p className="app-sec-sub">{subtitle}</p>}
    </div>
  );
};

const JourneyCard = ({ side, color, shadow, icon, tint, title, subtitle, badge, children }) => {
  const left = side === "left";
  return (
    <Reveal variant={left ? "left" : "right"} className={`relative md:w-1/2 pl-12 ${left ? "md:pr-12 md:mr-auto" : "md:pl-12 md:ml-auto"}`}>
      <span
        className={`absolute top-5 w-4 h-4 rounded-full border-[3px] border-[#0b0e19] z-10 ${color} left-[1.25rem] -translate-x-1/2 ${
          left ? "md:left-auto md:-right-2 md:translate-x-0" : "md:-left-2 md:translate-x-0"
        }`}
        style={{ boxShadow: shadow }}
      />
      <div className="premium-card rounded-2xl p-5 sm:p-6 relative overflow-hidden">
        <div className="flex items-center gap-3 mb-3">
          <span className={`flex items-center justify-center w-11 h-11 rounded-xl ${tint} border border-white/10 text-white shrink-0`}>
            {icon}
          </span>
          <div className="min-w-0">
            <p className="font-black text-white leading-tight truncate">{title}</p>
            {subtitle && <p className="text-[11px] font-bold text-base-content/55 truncate">{subtitle}</p>}
          </div>
          {badge}
        </div>
        {children}
      </div>
    </Reveal>
  );
};

const UserProfileView = () => {
  const { userId } = useParams();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [relationship, setRelationship] = useState("stranger");
  const [requestId, setRequestId] = useState(null);
  const [superConnect, setSuperConnect] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const [activeSection, setActiveSection] = useState("about");
  const [navSolid, setNavSolid] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(null);
  const pagePRef = useRef(0);
  const railElRef = useRef(null);
  const railFillRef = useRef(null);
  const railCometRef = useRef(null);
  const mediaRef = useRef(null);
  const mediaInView = useInView(mediaRef);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(BASE_URL + `user/profile/${userId}`, {
        withCredentials: true,
      });
      setProfile(res.data?.data || null);
      setRelationship(res.data?.relationship || "stranger");
      setRequestId(res.data?.requestId || null);
      setSuperConnect(Boolean(res.data?.superConnect));
    } catch (err) {
      setError(err?.response?.data?.message || "Could not load this profile");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const skillList = useMemo(() => {
    if (!profile?.skills) return [];
    const arr = Array.isArray(profile.skills)
      ? profile.skills
      : typeof profile.skills === "string"
        ? profile.skills.split(",").map((s) => s.trim())
        : [];
    return arr.filter(Boolean);
  }, [profile?.skills]);

  const allPhotos = useMemo(() => {
    const list = [];
    if (profile?.photoURL) list.push(profile.photoURL);
    if (Array.isArray(profile?.photos)) list.push(...profile.photos.filter(Boolean));
    return list;
  }, [profile?.photoURL, profile?.photos]);

  const ageNumber = useMemo(() => {
    if (!profile) return 0;
    if (profile.age) return profile.age;
    if (profile.dob) {
      const d = new Date(profile.dob + "T00:00:00");
      if (!isNaN(d)) {
        const diff = Date.now() - d.getTime();
        return Math.floor(diff / (365.25 * 24 * 3600 * 1000));
      }
    }
    return 0;
  }, [profile]);

  const career = useMemo(() => {
    if (!profile) return { role: null, company: null, degree: null };
    return {
      role: profile.work?.role || null,
      company: profile.work?.company || null,
      degree: profile.education?.degree || null,
    };
  }, [profile]);

  const locationText = useMemo(
    () => [profile?.location?.city, profile?.location?.country].filter(Boolean).join(", "),
    [profile?.location],
  );

  const socialLinks = useMemo(() => {
    if (!profile) return [];
    return [
      { platform: "github", value: profile.github },
      { platform: "linkedin", value: profile.linkedin },
      { platform: "portfolio", value: profile.portfolio },
    ].filter((l) => l.value && l.value.trim());
  }, [profile]);

  const codingLinks = useMemo(() => {
    if (!profile?.codingProfiles) return [];
    return CODING_PLATFORMS.map((p) => ({
      platform: p,
      value: profile.codingProfiles[p],
    })).filter((l) => l.value && l.value.trim());
  }, [profile]);

  const hobbies = useMemo(
    () => (Array.isArray(profile?.hobbies) ? profile.hobbies.filter(Boolean) : []),
    [profile?.hobbies],
  );
  const likes = useMemo(
    () => (Array.isArray(profile?.likes) ? profile.likes.filter(Boolean) : []),
    [profile?.likes],
  );
  const dislikes = useMemo(
    () => (Array.isArray(profile?.dislikes) ? profile.dislikes.filter(Boolean) : []),
    [profile?.dislikes],
  );

  const glyph = GENDER_GLYPH[profile?.gender];
  const rel = RELATION_META[relationship] || RELATION_META.stranger;
  const zodiac = zodiacFromDob(profile?.dob);
  const level = careerLevel(profile?.work?.experienceYears);

  const SECTIONS = useMemo(() => [
    { id: "about", label: "About", show: !!profile?.about },
    { id: "tech", label: "Stack", show: skillList.length > 0 },
    { id: "journey", label: "Journey", show: true },
    { id: "vibe", label: "Vibe", show: hobbies.length > 0 || likes.length > 0 || dislikes.length > 0 },
    { id: "media", label: "Media", show: allPhotos.length > 1 },
    { id: "links", label: "Links", show: socialLinks.length > 0 || codingLinks.length > 0 },
  ].filter((s) => s.show), [profile?.about, skillList.length, hobbies.length, likes.length, dislikes.length, allPhotos.length, socialLinks.length, codingLinks.length, profile?.resumeURL]);

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        const solid = y > 40;
        setNavSolid((prev) => (prev === solid ? prev : solid));
        const doc = document.documentElement;
        const max = doc.scrollHeight - window.innerHeight;
        pagePRef.current = max > 0 ? Math.min(Math.max(y / max, 0), 1) : 0;

        const bandTop = 100;
        const bandBottom = window.innerHeight;
        let bestId = SECTIONS[0]?.id || "about";
        let bestOverlap = -1;
        for (const s of SECTIONS) {
          const el = document.getElementById(s.id);
          if (!el) continue;
          const r = el.getBoundingClientRect();
          const top = Math.max(r.top, bandTop);
          const bottom = Math.min(r.bottom, bandBottom);
          const overlap = Math.max(0, bottom - top);
          if (overlap > bestOverlap) {
            bestOverlap = overlap;
            bestId = s.id;
          }
        }
        if (max > 0 && y >= max - 2) {
          bestId = SECTIONS[SECTIONS.length - 1]?.id || bestId;
        }
        setActiveSection(bestId);
        ticking = false;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [SECTIONS]);

  useEffect(() => {
    let raf;
    let last = performance.now();
    const s = { x: pagePRef.current, v: 0 };
    const K = 50;
    const C = 2 * Math.sqrt(K);
    const tick = (now) => {
      const dt = Math.min((now - last) / 1000, 1 / 30);
      last = now;
      const target = pagePRef.current;
      const a = K * (target - s.x) - C * s.v;
      s.v += a * dt;
      s.x += s.v * dt;
      if (Math.abs(target - s.x) < 0.0002 && Math.abs(s.v) < 0.0002) {
        s.x = target;
        s.v = 0;
      }
      const p = s.x;
      const fill = railFillRef.current;
      const comet = railCometRef.current;
      const rail = railElRef.current;
      if (fill) fill.style.transform = `translateX(-50%) scaleY(${p})`;
      if (comet) comet.style.top = `${p * 100}%`;
      if (rail) rail.style.setProperty("--cy", `${p * 100}%`);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const sendRequest = async (status) => {
    setBusy(true);
    try {
      await axios.post(
        `${BASE_URL}request/send/${status}/${userId}`,
        {},
        { withCredentials: true },
      );
      setRelationship(status === "interested" ? "sent_request" : "ignored");
    } catch (err) {
      console.error("Error sending request:", err);
    } finally {
      setBusy(false);
    }
  };

  const reviewRequest = async (status) => {
    setBusy(true);
    try {
      await axios.post(
        `${BASE_URL}request/review/${status}/${requestId}`,
        {},
        { withCredentials: true },
      );
      setRelationship(status === "accepted" ? "connection" : "ignored");
    } catch (err) {
      console.error("Error reviewing request:", err);
    } finally {
      setBusy(false);
    }
  };

  const renderActions = () => {
    const primary = "btn btn-primary btn-shine bg-gradient-to-r from-primary to-secondary border-none text-white rounded-2xl h-11 px-7 font-black text-xs uppercase tracking-wider shadow-lg shadow-primary/30 hover:scale-105 disabled:opacity-50 disabled:scale-100 transition-all w-full flex-nowrap";
    const ghost = "btn btn-outline border-white/15 text-slate-200 hover:bg-white/10 rounded-2xl h-11 px-6 font-black text-xs uppercase tracking-wider disabled:opacity-50 w-full";

    if (relationship === "self") {
      return (
        <>
          <Link to="/profile" className={primary}>Edit Profile</Link>
          {!profile?.isPremium && (
            <Link to="/premium" className="btn btn-outline border-amber-400/40 text-amber-300 hover:bg-amber-500/10 rounded-2xl h-11 px-6 font-black text-xs uppercase tracking-wider w-full">
              Go Pro
            </Link>
          )}
        </>
      );
    }

    if (relationship === "connection") {
      return (
        <>
          <Link to={`/chat/${userId}`} className={`${primary} inline-flex items-center justify-center gap-2 flex-nowrap`}>
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span className="leading-none translate-y-px whitespace-nowrap">Message</span>
          </Link>
          {profile?.resumeURL && (
            <a
              href={resolveMediaUrl(profile.resumeURL)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-shine group relative overflow-hidden inline-flex items-center justify-center gap-2 flex-nowrap border border-cyan-400/40 bg-cyan-400/5 text-cyan-300 rounded-2xl h-11 px-6 font-black text-xs uppercase tracking-wider hover:border-cyan-300/80 hover:bg-cyan-400/15 hover:text-cyan-100 hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/30 active:scale-95 transition-all w-full"
            >
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                <path d="M14 2v6h6" />
                <path d="M16 13H8M16 17H8M10 9H8" />
              </svg>
              <span className="leading-none translate-y-px whitespace-nowrap">Resume</span>
              <svg className="w-3 h-3 shrink-0 transition-transform duration-300 group-hover:translate-y-0.5 group-hover:-translate-x-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3v12M7 10l5 5 5-5" />
              </svg>
            </a>
          )}
        </>
      );
    }

    if (relationship === "received_request") {
      return (
        <>
          <button
            onClick={() => reviewRequest("accepted")}
            disabled={busy}
            className="app-accept w-full justify-center"
          >
            <span className="request-icon-wrap">
              <svg className="request-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </span>
            Accept
          </button>
          <button
            onClick={() => reviewRequest("rejected")}
            disabled={busy}
            className="app-decline w-full justify-center"
          >
            <span className="request-icon-wrap">
              <svg className="request-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </span>
            Decline
          </button>
        </>
      );
    }

    if (relationship === "sent_request") {
      return (
        <span className="col-span-2 w-full justify-center inline-flex items-center gap-1.5 px-5 py-2.5 rounded-2xl border border-emerald-400/40 bg-emerald-500/10 text-emerald-300 text-xs font-black uppercase tracking-wider">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          Request Sent
        </span>
      );
    }

    if (relationship === "ignored") {
      return (
        <span className="col-span-2 w-full justify-center inline-flex items-center gap-1.5 px-5 py-2.5 rounded-2xl border border-white/15 bg-white/5 text-slate-400 text-xs font-black uppercase tracking-wider">
          Passed
        </span>
      );
    }

    return (
      <>
        <button onClick={() => sendRequest("interested")} disabled={busy} className={primary}>
          Connect
        </button>
        <button onClick={() => sendRequest("ignored")} disabled={busy} className={ghost}>
          Pass
        </button>
      </>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[65vh]">
        <div className="relative flex flex-col items-center gap-3">
          <span className="loading loading-spinner loading-lg text-primary"></span>
          <p className="text-[11px] font-black uppercase tracking-[0.2em] text-base-content/40 animate-pulse">
            Loading profile
          </p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="relative flex justify-center items-center min-h-[70vh] p-4 overflow-hidden">
        <div className="aurora-blob w-72 h-72 bg-rose-500/20 -top-10 -left-16" />
        <div className="glass-card max-w-md w-full text-center p-10 rounded-[2rem] border border-white/10 shadow-2xl space-y-5 relative overflow-hidden fade-up">
          <h1 className="text-2xl font-black text-white">Profile Unavailable</h1>
          <p className="text-xs text-base-content/65 leading-relaxed">{error}</p>
          <Link
            to="/feed"
            className="relative btn btn-primary bg-gradient-to-r from-primary to-secondary border-none text-white rounded-2xl h-11 px-7 font-bold text-xs shadow-lg shadow-primary/30 hover:scale-105 transition-all"
          >
            Back to Deck
          </Link>
        </div>
      </div>
    );
  }

  const hasJourney =
    profile.work?.company || profile.work?.role || profile.education?.college || profile.education?.degree;

  return (
    <div className="relative overflow-hidden pb-20">
      <div className="dyn-bg" aria-hidden="true">
        <span className="dyn-mesh" />
        <span className="dyn-blob dyn-blob-rose" />
        <span className="dyn-blob dyn-blob-indigo" />
        <span className="dyn-blob dyn-blob-fuchsia" />
        <span className="dyn-halo" />
        <span className="dyn-grain" />
      </div>

      {/* ══════════ PROFESSIONAL SECTION NAV ══════════ */}
      <nav className={`app-nav${navSolid ? " app-nav--solid" : ""}`} aria-label="Profile sections">
        <div className="app-nav-inner">
          <div className="app-nav-left">
            <Magnetic strength={0.45} className="app-nav-back-wrap">
              <button
                onClick={() => navigate(-1)}
                className="app-nav-back"
                title="Go back"
                aria-label="Go back"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            </Magnetic>
            <Link to="/feed" className="app-nav-brand" title="Back to your deck">
              <span className="app-nav-brand-mark">
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
              </span>
              <span className="app-nav-brand-name">
                Dev<b>Tinder</b>
              </span>
            </Link>
            <span className="app-nav-divider hidden sm:block" />
            <span className="app-nav-name">
              {profile.firstName}
              <span className="app-nav-name-sub hidden sm:inline"> · Profile</span>
            </span>
          </div>

          <div className="app-nav-links">
            {SECTIONS.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById(s.id)?.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
                className="app-nav-link"
              >
                {s.label}
              </a>
            ))}
          </div>
        </div>
      </nav>

      {/* ══════════ VERTICAL SCROLL RAIL ══════════ */}
      <div className="page-rail" aria-hidden="true" ref={railElRef}>
        <span className="page-rail-track" />
        <span className="page-rail-fill" ref={railFillRef} />
        <span className="page-rail-comet" ref={railCometRef} />
        {SECTIONS.map((s, i) => {
          const activeIdx = Math.max(0, SECTIONS.findIndex((x) => x.id === activeSection));
          return (
            <span
              key={s.id}
              className={`page-rail-node${i <= activeIdx ? " on" : ""}${i === activeIdx ? " live" : ""}`}
              style={{ top: `${(i / Math.max(SECTIONS.length - 1, 1)) * 100}%`, "--nc": RAIL_COLORS[i % RAIL_COLORS.length] }}
            />
          );
        })}
      </div>

      {/* ══════════ PROFILE SHELL — SIDEBAR + CONTENT ══════════ */}      <div className="app-shell relative max-w-7xl mx-auto px-4 sm:px-6 pt-14 sm:pt-16 pb-10">
        <div className="grid gap-6 lg:gap-8 lg:grid-cols-[340px_minmax(0,1fr)] lg:items-start">

          {/* ——— left rail ——— */}
          <aside className="app-sidebar space-y-5 lg:sticky lg:top-24 lg:self-start">
            {/* identity card */}
            <div className="app-side-card premium-card rounded-3xl p-6 text-center">
              <span className="chat-orb absolute -top-16 -left-16 w-56 h-56 rounded-full bg-primary/15 blur-3xl" />
              <div className="app-avatar-stage mx-auto">
                <span className="app-avatar-halo" aria-hidden="true" />
                <button
                  type="button"
                  className="app-avatar group relative cursor-pointer"
                  onClick={() => allPhotos.length > 0 && setViewerIndex(0)}
                  title={allPhotos.length > 1 ? "Click to open photo archive" : "Click to view photo"}
                >
                  <MediaImage
                    src={profile.photoURL}
                    alt={`${profile.firstName} ${profile.lastName || ""}`}
                    className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover"
                  />
                  <span className="app-avatar-view">
                    <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/50 border border-white/20 text-[10px] font-black uppercase tracking-widest text-white backdrop-blur-sm">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z" />
                      </svg>
                      View
                    </span>
                  </span>
                </button>
              </div>

              <h1 className="app-side-name">
                {profile.firstName}
                {profile.lastName ? <span className="app-side-name-last"> {profile.lastName}</span> : null}
              </h1>

              {(career.role || career.company || career.degree) && (
                <p className="app-side-title">
                  <span className="app-side-ic">
                    {career.role || career.company ? (
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="2" y="7" width="20" height="14" rx="2" />
                        <path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16" />
                      </svg>
                    ) : (
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
                      </svg>
                    )}
                  </span>
                  <span className="truncate">
                    {career.role && <span>{career.role}</span>}
                    {career.role && career.company && <span className="app-side-title-at"> @ {career.company}</span>}
                    {!career.role && career.company && <span>{career.company}</span>}
                    {!career.role && !career.company && career.degree && <span>{career.degree}</span>}
                  </span>
                </p>
              )}

              <div className="app-side-divider" aria-hidden="true" />

              {locationText && (
                <p className="app-side-loc">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {locationText}
                </p>
              )}

              <div className="app-side-badges">
                {superConnect && (
                  <span
                    title="You two super connected with each other's profiles ⭐"
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-amber-400/50 bg-amber-500/15 text-amber-300 text-[11px] font-black tracking-wide shadow-lg shadow-amber-500/10"
                  >
                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    Super Connected
                  </span>
                )}
                <span className={`inline-flex items-center gap-1 px-3.5 py-1.5 rounded-full border text-[11px] font-bold ${rel.cls}`}>
                  {relationship === "connection" && (
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                  {rel.label}
                </span>
                <MembershipBadge membershipType={profile.membershipType} isPremium={profile.isPremium} size="sm" />
                {glyph && (
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full border text-[11px] font-bold ${glyph.cls}`}>
                    {glyph.symbol} {profile.gender}
                  </span>
                )}
                {zodiac && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full border border-violet-400/30 bg-violet-500/10 text-violet-200 text-[11px] font-bold">
                    {zodiac}
                  </span>
                )}
              </div>

              <div className="app-side-actions">
                {renderActions()}
              </div>
            </div>

      {/* ══════════ STATS CARD ══════════ */}
      <div className="app-stats premium-card rounded-3xl">
        <div className="app-stats-head">
          <span className="app-stats-head-title">
            <span className="app-stats-live" aria-hidden="true" />
            <span className="app-stats-head-label">Profile Overview</span>
          </span>
          <span className="app-stats-head-meta">realtime</span>
        </div>
        <div className="app-stats-grid grid grid-cols-2">
            <StatCell
              label="Age"
              accent="#ff2d55"
              sub={zodiac}
              target={Math.min(1, ageNumber / 100)}
              delay={0}
              to={ageNumber}
              icon={
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M8 2v4M16 2v4M3 9h18M5 5h14a1 1 0 011 1v14a1 1 0 01-1 1H5a1 1 0 01-1-1V6a1 1 0 011-1z" />
                  <path d="M12 17a3 3 0 100-6 3 3 0 000 6z" />
                </svg>
              }
            />
            <StatCell
              label="Experience"
              accent="#22d3ee"
              sub={level}
              target={Math.min(1, (profile.work?.experienceYears || 0) / 50)}
              delay={140}
              to={profile.work?.experienceYears || 0}
              unit={profile.work?.experienceYears > 0 ? "yrs" : undefined}
              icon={
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="7" width="20" height="13" rx="2" />
                  <path d="M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2M16 12h.01M12 12h.01M8 12h.01" />
                </svg>
              }
            />
            <StatCell
              label="Skills"
              accent="#a78bfa"
              target={Math.min(1, skillList.length / 40)}
              delay={280}
              to={skillList.length}
              icon={
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M8 6l-6 6 6 6M16 6l6 6-6 6" />
                </svg>
              }
            />
            <StatCell
              label="Photos"
              accent="#fbbf24"
              target={Math.min(1, allPhotos.length / 20)}
              delay={420}
              to={allPhotos.length}
              icon={
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="5" width="18" height="14" rx="2" />
                  <path d="M3 15l4.5-4.5a1 1 0 011.4 0L12 13.5M21 11l-2.5-2.5a1 1 0 00-1.4 0L15 10.5" />
                  <circle cx="8.5" cy="8.5" r="1.3" />
                </svg>
              }
            />
          </div>
        </div>
      </aside>

          {/* ——— main content ——— */}
          <div className="min-w-0 space-y-12 sm:space-y-14">

      {/* ══════════ ABOUT ══════════ */}
      {profile.about && (
        <section id="about" className="relative scroll-mt-28">
          <Reveal>
            <SectionHeader index={1} title="About" subtitle="Who they are, in their own words" />
            <div className="quote-card premium-card rounded-3xl p-7 sm:p-9 relative overflow-hidden">
              <span className="chat-orb absolute -top-16 -right-16 w-56 h-56 rounded-full bg-primary/10 blur-3xl" />
              <WordReveal text={profile.about} />
              <p className="mt-5 font-mono text-[10px] font-bold tracking-[0.3em] text-base-content/35">
                ~ <span className="quote-name">{profile.firstName} {profile.lastName || ""}</span>
              </p>
            </div>
          </Reveal>
        </section>
      )}

      {/* ══════════ TECH CONSTELLATION ══════════ */}
      {skillList.length > 0 && (
        <section id="tech" className="relative scroll-mt-28">
          <Reveal>
            <SectionHeader index={2} title="Tech Constellation" subtitle="A live star map of their stack — hover a star to highlight it" />
          </Reveal>
          <Reveal variant="zoom">
            <div className="constellation-panel relative rounded-[2rem] overflow-hidden border border-white/10 bg-[#070912]">
              <span className="pointer-events-none absolute top-4 left-5 font-mono text-[10px] font-bold tracking-[0.3em] text-base-content/40 z-10">
                starmap.sys
              </span>
              <ConstellationCanvas skills={skillList} />
              <div className="absolute bottom-4 left-5 flex items-center gap-2 text-[10px] font-bold text-base-content/45 pointer-events-none">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                {skillList.length} stars mapped
              </div>
            </div>
          </Reveal>
        </section>
      )}

      {/* ══════════ JOURNEY TIMELINE ══════════ */}
      <section id="journey" className="relative scroll-mt-28">
        <Reveal>
          <SectionHeader index={3} title="The Journey" subtitle="Work & education across time" />
        </Reveal>
        <div className="relative">
          <span className="journey-line absolute left-[1.25rem] md:left-1/2 -translate-x-1/2 top-2 bottom-2 w-[2px] bg-gradient-to-b from-primary/60 via-secondary/30 to-transparent" />
          <div className="space-y-10">
            {(profile.work?.company || profile.work?.role) && (
              <JourneyCard
                side="left"
                color="bg-emerald-400"
                shadow="0 0 16px rgba(52,211,153,0.8)"
                tint="bg-emerald-500/15 border-emerald-400/30"
                title={profile.work.role || "Software Engineer"}
                subtitle={profile.work.company ? `@ ${profile.work.company}` : null}
                icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>}
                badge={level && (
                  <span className="ml-auto shrink-0 px-2 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-400/30 text-[9px] font-black uppercase tracking-wider text-emerald-300">
                    {level}
                  </span>
                )}
              >
                {typeof profile.work.experienceYears === "number" && profile.work.experienceYears > 0 && (
                  <div>
                    <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-base-content/50 mb-1.5">
                      <span>Experience</span>
                      <span className="text-emerald-400">{profile.work.experienceYears}+ yrs</span>
                    </div>
                    <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 animate-grow-bar"
                        style={{ "--bar-w": `${Math.min((profile.work.experienceYears / 30) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                )}
              </JourneyCard>
            )}

            {(profile.education?.college || profile.education?.degree) && (
              <JourneyCard
                side="right"
                color="bg-indigo-400"
                shadow="0 0 16px rgba(129,140,248,0.8)"
                tint="bg-indigo-500/15 border-indigo-400/30"
                title={profile.education.college || "University"}
                subtitle={profile.education.degree || null}
                icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" /></svg>}
                badge={profile.education.passingYear && (
                  <span className="ml-auto shrink-0 px-2 py-0.5 rounded-md bg-indigo-500/15 border border-indigo-400/30 text-[9px] font-black uppercase tracking-wider text-indigo-300">
                    Class of {profile.education.passingYear}
                  </span>
                )}
              >
                {typeof profile.education.cgpa === "number" && (
                  <div>
                    <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-base-content/50 mb-1.5">
                      <span>CGPA</span>
                      <span className="text-indigo-300">{profile.education.cgpa.toFixed(2)} / 10</span>
                    </div>
                    <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-sky-400 animate-grow-bar"
                        style={{ "--bar-w": `${(profile.education.cgpa / 10) * 100}%` }}
                      />
                    </div>
                  </div>
                )}
              </JourneyCard>
            )}

            {!hasJourney && (
              <Reveal className="max-w-md mx-auto">
                <div className="premium-card rounded-2xl p-6 text-center text-sm text-base-content/50">
                  Journey details not shared yet.
                </div>
              </Reveal>
            )}
          </div>
        </div>
      </section>

      {/* ══════════ VIBE ══════════ */}
      {(hobbies.length > 0 || likes.length > 0 || dislikes.length > 0) && (
        <section id="vibe" className="relative scroll-mt-28">
          <Reveal>
            <SectionHeader index={4} title="The Vibe" subtitle="Hobbies, likes & dislikes — each with its own energy" />
          </Reveal>
          <div className="grid md:grid-cols-3 gap-4">
            {hobbies.length > 0 && (
              <Reveal variant="up" className="vibe-shine premium-card rounded-3xl p-6 relative overflow-hidden">
                <span className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-amber-500/15 blur-3xl" />
                <div className="flex items-center gap-2 mb-4">
                  <span className="flex items-center justify-center w-9 h-9 rounded-lg bg-amber-500/15 border border-amber-400/25 text-amber-300 text-sm">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l2.4 6.2L21 8l-5 4.4 1.8 6.8L12 15.6 6.2 19.2 8 12.4 3 8l6.6.2L12 2z" /></svg>
                  </span>
                  <h3 className="text-xs font-black uppercase tracking-[0.18em] text-base-content/60">Hobbies</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {hobbies.map((h, i) => (
                    <span
                      key={`h-${i}`}
                      className="interest-bubble pill-in inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-amber-400/30 bg-amber-500/10 text-amber-100 text-xs font-bold"
                      style={{ animationDelay: `${i * 90}ms` }}
                    >
                      <span className="text-amber-300">✦</span>
                      {h}
                    </span>
                  ))}
                </div>
              </Reveal>
            )}

            {likes.length > 0 && (
              <Reveal variant="up" delay={80} className="vibe-shine premium-card rounded-3xl p-6 relative overflow-hidden">
                <span className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-emerald-500/15 blur-3xl" />
                <div className="flex items-center gap-2 mb-4">
                  <span className="flex items-center justify-center w-9 h-9 rounded-lg bg-emerald-500/15 border border-emerald-400/25 text-emerald-300 text-sm">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" /></svg>
                  </span>
                  <h3 className="text-xs font-black uppercase tracking-[0.18em] text-base-content/60">Likes</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {likes.map((l, i) => (
                    <span
                      key={`l-${i}`}
                      className="interest-like pill-in inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-emerald-400/30 bg-emerald-500/10 text-emerald-100 text-xs font-bold"
                      style={{ animationDelay: `${i * 90}ms` }}
                    >
                      <span className="interest-heart text-emerald-300">♥</span>
                      {l}
                    </span>
                  ))}
                </div>
              </Reveal>
            )}

            {dislikes.length > 0 && (
              <Reveal variant="up" delay={160} className="vibe-shine premium-card rounded-3xl p-6 relative overflow-hidden">
                <span className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-rose-500/15 blur-3xl" />
                <div className="flex items-center gap-2 mb-4">
                  <span className="flex items-center justify-center w-9 h-9 rounded-lg bg-rose-500/15 border border-rose-400/25 text-rose-300 text-sm">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2a10 10 0 100 20 10 10 0 000-20zm3.71 13.29a1 1 0 01-1.42 0L12 12.41l-2.29 2.88a1 1 0 11-1.42-1.42L10.59 11l-2.3-2.87a1 1 0 111.42-1.42L12 9.59l2.29-2.88a1 1 0 011.42 1.42L13.41 11l2.3 2.87a1 1 0 010 1.42z" /></svg>
                  </span>
                  <h3 className="text-xs font-black uppercase tracking-[0.18em] text-base-content/60">Dislikes</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {dislikes.map((d, i) => (
                    <span
                      key={`d-${i}`}
                      className="interest-dislike pill-in inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-rose-400/30 bg-rose-500/10 text-rose-100 text-xs font-bold"
                      style={{ animationDelay: `${i * 90}ms` }}
                    >
                      <span className="text-rose-300">✕</span>
                      {d}
                    </span>
                  ))}
                </div>
              </Reveal>
            )}
          </div>
        </section>
      )}

      {/* ══════════ MEDIA GALLERY ══════════ */}
      {allPhotos.length > 1 && (
        <section id="media" className="relative scroll-mt-28">
          <Reveal>
            <SectionHeader
              index={5}
              title="Media Gallery"
              subtitle="A living wall of moments — click any frame to open the archive"
            />
          </Reveal>
          <div ref={mediaRef} className={`gal-grid${mediaInView ? " gal-on" : ""}`}>
            {allPhotos.map((p, i) => {
              const accent = PHOTO_ACCENTS[i % PHOTO_ACCENTS.length];
              return (
                <button
                  key={i}
                  onClick={() => setViewerIndex(i)}
                  title="Click to view full photo"
                  className="gal-card group/gal relative block w-full text-left"
                  style={{ "--gc": accent, "--d": `${(i % 6) * 90}ms` }}
                >
                  <MediaImage src={p} alt={`Photo ${i + 1}`} className="gal-img w-full h-full object-cover" />
                  <span className="gal-aura" aria-hidden="true" />
                  <span className="gal-scan" aria-hidden="true" />
                  <span className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/0 to-black/0 pointer-events-none" />
                  <span className="gal-meta absolute inset-x-0 bottom-0 p-3 flex items-center justify-between">
                    <p className="text-[10px] font-black text-white/90">{profile.firstName}'s moment</p>
                    <span className="font-mono text-[8px] tracking-[0.2em] text-white/60">{String(i + 1).padStart(2, "0")}</span>
                  </span>
                  <span className="gal-view absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover/gal:opacity-100 transition-opacity duration-300 pointer-events-none">
                    <span className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-black/55 border border-white/25 text-[10px] font-black uppercase tracking-widest text-white backdrop-blur-sm">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z" />
                      </svg>
                      View
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* ══════════ LINKS ══════════ */}
      {(socialLinks.length > 0 || codingLinks.length > 0) && (
        <section id="links" className="relative scroll-mt-28">
          <Reveal>
            <SectionHeader index={6} title="Connect Elsewhere" subtitle="Find them across the web" />
          </Reveal>
          <div className="flex flex-wrap gap-2.5">
            {socialLinks.map((l, idx) => {
              const href = getProfileLink(l.value.trim(), l.platform);
              if (!href) return null;
              return (
                <Reveal key={l.platform} variant="up" delay={idx * 60}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ backgroundColor: l.platform === "portfolio" ? "#0ea5e9" : BRAND_COLORS[l.platform] }}
                    className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-white text-xs font-black uppercase tracking-wider shadow-md hover:scale-105 hover:shadow-xl active:scale-95 transition-all"
                  >
                    <PlatformIcon platform={l.platform} />
                    {LINK_LABELS[l.platform] || l.platform}
                  </a>
                </Reveal>
              );
            })}
            {codingLinks.map((l, idx) => {
              const href = getProfileLink(l.value.trim(), l.platform);
              if (!href) return null;
              return (
                <Reveal key={l.platform} variant="up" delay={(socialLinks.length + 1 + idx) * 60}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ backgroundColor: BRAND_COLORS[l.platform] }}
                    className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-white text-xs font-bold uppercase tracking-wider shadow-md hover:scale-105 hover:shadow-xl active:scale-95 transition-all"
                  >
                    <PlatformIcon platform={l.platform} />
                    {LINK_LABELS[l.platform] || l.platform}
                  </a>
                </Reveal>
              );
            })}
          </div>
        </section>
      )}

          </div>
        </div>

      {/* footer hint */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 mt-16 text-center">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 bg-white/5 text-slate-200 text-xs font-bold hover:bg-white/10 hover:scale-105 active:scale-95 transition-all"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
        <p className="mt-4 font-mono text-[9px] font-bold tracking-[0.35em] text-base-content/30">
          PROFILE_VIEW_v3 · DEV_SIGNAL_ACTIVE
        </p>
      </div>
      </div>

      {viewerIndex !== null && allPhotos.length > 0 && (
        <PhotoViewer
          photos={allPhotos}
          index={viewerIndex}
          setIndex={setViewerIndex}
          onClose={() => setViewerIndex(null)}
          firstName={profile.firstName}
        />
      )}
    </div>
  );
};

export default UserProfileView;

