import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { useSelector } from "react-redux";
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

const GENDER_GLYPH = {
  Male: { symbol: "♂", cls: "border-sky-400/40 bg-sky-500/15 text-sky-300" },
  Female: { symbol: "♀", cls: "border-pink-400/40 bg-pink-500/15 text-pink-300" },
  Others: { symbol: "⚧", cls: "border-violet-400/40 bg-violet-500/15 text-violet-300" },
};

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

const formatDob = (dob) => {
  if (!dob) return null;
  const d = new Date(dob + "T00:00:00");
  if (isNaN(d)) return null;
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
};

const careerLevel = (years) => {
  if (!years || years <= 0) return null;
  if (years < 2) return "Fresher";
  if (years < 4) return "Junior";
  if (years < 7) return "Mid-level";
  if (years < 11) return "Senior";
  return "Principal / Lead";
};

const CountUp = ({ to, duration = 1000 }) => {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let raf;
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1);
      setVal(Math.round(to * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [to, duration]);
  return <>{val}</>;
};

const RingGauge = ({ pct, children, color = "#ff2d55", size = 66, ringW = 6 }) => (
  <div className="relative shrink-0" style={{ width: size, height: size }}>
    <div
      className="ring-gauge absolute inset-0"
      style={{ "--ring-p": `${pct}%`, "--ring-color": color, "--ring-w": `${ringW}px` }}
    />
    <div
      className="absolute rounded-full bg-[#0c0e19]/80 flex flex-col items-center justify-center text-center overflow-hidden"
      style={{ inset: ringW + 1 }}
    >
      {children}
    </div>
  </div>
);

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

const SectionHeader = ({ index, title, subtitle }) => (
  <div className="flex items-end justify-between gap-4 mb-8">
    <div>
      <p className="font-mono text-[10px] font-bold tracking-[0.35em] text-primary/70 mb-2">
        0{index} / {title.toLowerCase().replace(/\s+/g, "_")}
      </p>
      <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">{title}</h2>
      {subtitle && <p className="mt-1 text-xs font-semibold text-base-content/50">{subtitle}</p>}
    </div>
    <span className="hidden sm:block w-24 h-px bg-gradient-to-r from-primary/50 to-transparent mb-2" />
  </div>
);

const JourneyCard = ({ side, color, shadow, icon, tint, title, subtitle, badge, children }) => {
  const left = side === "left";
  return (
    <Reveal variant={left ? "left" : "right"} className={`relative md:w-1/2 pl-12 ${left ? "md:pr-12 md:mr-auto" : "md:pl-12 md:ml-auto"}`}>
      <span
        className={`absolute top-5 w-4 h-4 rounded-full border-[3px] border-[#0b0e19] z-10 ${color} left-[1.05rem] ${
          left ? "md:left-auto md:-right-2" : "md:-left-2"
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const [activeSection, setActiveSection] = useState("about");
  const [scrollY, setScrollY] = useState(0);

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

  const headline = useMemo(() => {
    if (!profile) return null;
    if (profile.isStudent) {
      if (profile.education?.degree) return profile.education.degree;
      if (profile.work?.role)
        return profile.work.company
          ? `${profile.work.role} @ ${profile.work.company}`
          : profile.work.role;
      return null;
    }
    if (profile.work?.role)
      return profile.work.company
        ? `${profile.work.role} @ ${profile.work.company}`
        : profile.work.role;
    if (profile.education?.degree) return profile.education.degree;
    return null;
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
  const dobText = formatDob(profile?.dob);
  const zodiac = zodiacFromDob(profile?.dob);
  const level = careerLevel(profile?.work?.experienceYears);

  const SECTIONS = useMemo(() => [
    { id: "about", label: "About", show: !!profile?.about },
    { id: "tech", label: "Stack", show: skillList.length > 0 },
    { id: "journey", label: "Journey", show: true },
    { id: "vibe", label: "Vibe", show: hobbies.length > 0 || likes.length > 0 || dislikes.length > 0 },
    { id: "media", label: "Media", show: allPhotos.length > 1 },
    { id: "links", label: "Links", show: socialLinks.length > 0 || codingLinks.length > 0 || !!profile?.resumeURL },
  ].filter((s) => s.show), [profile?.about, skillList.length, hobbies.length, likes.length, dislikes.length, allPhotos.length, socialLinks.length, codingLinks.length, profile?.resumeURL]);

  useEffect(() => {
    const onScroll = () => {
      setScrollY(window.scrollY);
      let cur = SECTIONS[0]?.id || "about";
      for (const s of SECTIONS) {
        const el = document.getElementById(s.id);
        if (el && el.getBoundingClientRect().top <= 140) cur = s.id;
      }
      setActiveSection(cur);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [SECTIONS]);

  const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

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
    const primary = "btn btn-primary btn-shine bg-gradient-to-r from-primary to-secondary border-none text-white rounded-2xl h-11 px-7 font-black text-xs uppercase tracking-wider shadow-lg shadow-primary/30 hover:scale-105 disabled:opacity-50 disabled:scale-100 transition-all";
    const ghost = "btn btn-outline border-white/15 text-slate-200 hover:bg-white/10 rounded-2xl h-11 px-6 font-black text-xs uppercase tracking-wider disabled:opacity-50";

    if (relationship === "self") {
      return (
        <>
          <Link to="/profile" className={primary}>Edit Profile</Link>
          {!profile?.isPremium && (
            <Link to="/premium" className="btn btn-outline border-amber-400/40 text-amber-300 hover:bg-amber-500/10 rounded-2xl h-11 px-6 font-black text-xs uppercase tracking-wider">
              Go Pro
            </Link>
          )}
        </>
      );
    }

    if (relationship === "connection") {
      return (
        <>
          <Link to={`/chat/${userId}`} className={primary}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            Message
          </Link>
          {profile?.resumeURL && (
            <a href={resolveMediaUrl(profile.resumeURL)} target="_blank" rel="noopener noreferrer" className={ghost}>
              Resume
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
            className="btn btn-primary bg-gradient-to-r from-emerald-500 to-teal-400 border-none text-white rounded-2xl h-11 px-7 font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/30 hover:scale-105 disabled:opacity-50 disabled:scale-100 transition-all"
          >
            Accept
          </button>
          <button
            onClick={() => reviewRequest("rejected")}
            disabled={busy}
            className="btn btn-outline border-rose-400/40 text-rose-300 hover:bg-rose-500/10 rounded-2xl h-11 px-6 font-black text-xs uppercase tracking-wider disabled:opacity-50"
          >
            Decline
          </button>
        </>
      );
    }

    if (relationship === "sent_request") {
      return (
        <span className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-2xl border border-emerald-400/40 bg-emerald-500/10 text-emerald-300 text-xs font-black uppercase tracking-wider">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          Request Sent
        </span>
      );
    }

    if (relationship === "ignored") {
      return (
        <span className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-2xl border border-white/15 bg-white/5 text-slate-400 text-xs font-black uppercase tracking-wider">
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

  const coverImg = resolveMediaUrl(profile.photoURL);
  const filmPhotos = allPhotos.length > 1 ? [...allPhotos, ...allPhotos] : allPhotos;
  const hasJourney =
    profile.work?.company || profile.work?.role || profile.education?.college || profile.education?.degree;

  return (
    <div className="relative overflow-hidden pb-20">
      <div className="aurora-blob w-96 h-96 bg-rose-500/[0.16] top-24 -left-32" />
      <div className="aurora-blob w-80 h-80 bg-indigo-500/[0.14] top-[70rem] -right-28" style={{ animationDelay: "-7s" }} />
      <div className="aurora-blob w-72 h-72 bg-fuchsia-500/[0.10] top-[140rem] left-1/4" style={{ animationDelay: "-14s" }} />

      {/* scrollspy rail */}
      <nav className="fixed right-5 top-1/2 -translate-y-1/2 z-40 hidden lg:flex flex-col items-end gap-4">
        {SECTIONS.map((s) => (
          <button
            key={s.id}
            onClick={() => scrollToSection(s.id)}
            className={`rail-btn flex items-center gap-2.5 ${activeSection === s.id ? "active" : ""}`}
          >
            <span className="rail-label text-[10px] font-black uppercase tracking-widest text-base-content/50">
              {s.label}
            </span>
            <span className="rail-dot" />
          </button>
        ))}
      </nav>

      {/* ══════════ CINEMATIC COVER HERO ══════════ */}
      <section className="relative min-h-[78vh] flex flex-col justify-end overflow-hidden">
        <div
          className="cover-hero-media absolute inset-0"
          style={{ transform: `translateY(${Math.min(scrollY * 0.16, 140)}px)` }}
        >
          <img
            src={coverImg}
            alt=""
            className="w-full h-full object-cover scale-110 blur-[3px] brightness-[0.42]"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#070912]/70 via-[#070912]/55 to-[#070912]" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#070912]/60 via-transparent to-[#070912]/60" />
        </div>
        <span className="chat-orb absolute -top-24 left-1/4 w-80 h-80 rounded-full bg-primary/20 blur-3xl" />
        <span className="chat-orb absolute bottom-10 right-10 w-72 h-72 rounded-full bg-secondary/20 blur-3xl" style={{ animationDelay: "-6s" }} />

        <div className="relative max-w-3xl mx-auto w-full text-center px-4 pt-14 pb-10">
          <div className="fade-up relative inline-block">
            <div className="avatar-ring breath-glow rounded-full p-[3px] mx-auto" style={{ "--bglow": "rgba(255,45,85,0.7)" }}>
              <MediaImage
                src={profile.photoURL}
                alt={`${profile.firstName} ${profile.lastName || ""}`}
                className="w-28 h-28 sm:w-32 sm:h-32 rounded-full object-cover"
              />
            </div>
            <span
              title="Online"
              className="absolute bottom-1.5 right-1.5 w-5 h-5 rounded-full bg-emerald-500 border-[3px] border-[#070912] shadow-[0_0_14px_rgba(16,185,129,0.85)]"
            />
          </div>

          <h1 className="mt-5 text-4xl sm:text-5xl font-black tracking-tight text-shimmer fade-up" style={{ animationDelay: "80ms" }}>
            {profile.firstName} <span className="font-light text-white/90">{profile.lastName}</span>
          </h1>

          {headline && (
            <p className="caret-blink mt-3 text-sm sm:text-base font-bold text-primary/90 fade-up" style={{ animationDelay: "140ms" }}>
              {headline}
            </p>
          )}

          <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5 fade-up" style={{ animationDelay: "200ms" }}>
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
            {locationText && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-slate-200 text-[11px] font-bold">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {locationText}
              </span>
            )}
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3 fade-up" style={{ animationDelay: "260ms" }}>
            {renderActions()}
          </div>
        </div>
      </section>

      {/* ══════════ HUD STATS STRIP ══════════ */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 -mt-4">
        <div className="hud-rise premium-card rounded-3xl px-5 py-4 sm:px-8 grid grid-cols-4 gap-2 sm:gap-4">
          <div className="flex items-center gap-2.5 sm:gap-3.5">
            <RingGauge pct={Math.min(ageNumber, 100)} color="#ff2d55">
              <span className="text-sm sm:text-lg font-black text-white leading-none">
                <CountUp to={ageNumber} />
              </span>
            </RingGauge>
            <div className="min-w-0">
              <p className="text-lg sm:text-2xl font-black text-white leading-none">
                <CountUp to={ageNumber} />
              </p>
              <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.14em] text-base-content/50 mt-0.5">Age</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 sm:gap-3.5">
            <RingGauge pct={Math.min((profile.work?.experienceYears || 0) / 30, 1) * 100} color="#34d399">
              <span className="text-sm sm:text-lg font-black text-white leading-none">
                <CountUp to={profile.work?.experienceYears || 0} />
              </span>
            </RingGauge>
            <div className="min-w-0">
              <p className="text-lg sm:text-2xl font-black text-white leading-none">
                <CountUp to={profile.work?.experienceYears || 0} />+
              </p>
              <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.14em] text-base-content/50 mt-0.5">Exp</p>
            </div>
          </div>
          <div className="flex flex-col items-center justify-center gap-1 text-center">
            <p className="text-lg sm:text-2xl font-black text-white leading-none">
              <CountUp to={skillList.length} />
            </p>
            <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.14em] text-base-content/50">Skills</p>
          </div>
          <div className="flex flex-col items-center justify-center gap-1 text-center">
            <p className="text-lg sm:text-2xl font-black text-white leading-none">
              <CountUp to={allPhotos.length} />
            </p>
            <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.14em] text-base-content/50">Photos</p>
          </div>
        </div>
      </div>

      {/* ══════════ ABOUT ══════════ */}
      {profile.about && (
        <section id="about" className="relative max-w-3xl mx-auto px-4 pt-16 scroll-mt-24">
          <Reveal>
            <SectionHeader index={1} title="About" subtitle="Who they are, in their own words" />
            <div className="premium-card rounded-3xl p-7 sm:p-9 relative overflow-hidden">
              <span className="chat-orb absolute -top-16 -right-16 w-56 h-56 rounded-full bg-primary/10 blur-3xl" />
              <span className="absolute top-6 left-7 font-serif text-7xl leading-none text-primary/25 select-none">"</span>
              <p className="pl-2 text-base sm:text-lg text-base-content/85 leading-relaxed">{profile.about}</p>
              <p className="mt-5 font-mono text-[10px] font-bold tracking-[0.3em] text-base-content/35">
                ~ {profile.firstName} {profile.lastName || ""}
              </p>
            </div>
          </Reveal>
        </section>
      )}

      {/* ══════════ TECH CONSTELLATION ══════════ */}
      {skillList.length > 0 && (
        <section id="tech" className="relative max-w-5xl mx-auto px-4 pt-16 scroll-mt-24">
          <Reveal>
            <SectionHeader index={2} title="Tech Constellation" subtitle="A live star map of their stack — slow orbits, twinkling nodes, passing comets" />
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
      <section id="journey" className="relative max-w-4xl mx-auto px-4 pt-16 scroll-mt-24">
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
        <section id="vibe" className="relative max-w-5xl mx-auto px-4 pt-16 scroll-mt-24">
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

      {/* ══════════ MEDIA FILM STRIP ══════════ */}
      {allPhotos.length > 1 && (
        <section id="media" className="relative max-w-6xl mx-auto px-4 pt-16 scroll-mt-24">
          <Reveal>
            <SectionHeader index={5} title="Media Reel" subtitle="A slow scrolling film of their moments" />
          </Reveal>
          <Reveal variant="up">
            <div className="film-mask overflow-hidden py-3">
              <div className="animate-film flex gap-4 w-max">
                {filmPhotos.map((p, i) => (
                  <div key={`f-${i}`} className="film-cell relative w-64 h-44 sm:w-72 sm:h-52 rounded-2xl overflow-hidden border border-white/10 shrink-0 group-photo">
                    <MediaImage src={p} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/45 to-transparent pointer-events-none" />
                    <div className="absolute bottom-0 inset-x-0 px-3 py-2 flex items-center justify-between">
                      <p className="text-[10px] font-black text-white/90">{profile.firstName}'s moment</p>
                      <span className="font-mono text-[8px] tracking-[0.2em] text-white/50">{String(i + 1).padStart(2, "0")}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </section>
      )}

      {/* ══════════ LINKS ══════════ */}
      {(socialLinks.length > 0 || codingLinks.length > 0 || profile.resumeURL) && (
        <section id="links" className="relative max-w-4xl mx-auto px-4 pt-16 scroll-mt-24">
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
            {profile.resumeURL && (
              <Reveal variant="up" delay={socialLinks.length * 60}>
                <a
                  href={resolveMediaUrl(profile.resumeURL)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group/resume relative overflow-hidden inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-gradient-to-br from-primary to-secondary text-white text-xs font-black uppercase tracking-wider shadow-lg shadow-primary/30 hover:scale-105 hover:shadow-primary/50 active:scale-95 transition-all"
                >
                  <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent group-hover/resume:translate-x-full transition-transform duration-700" />
                  <svg className="w-3.5 h-3.5 relative" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                    <path d="M14 2v6h6" />
                    <path d="M12 18v-6" />
                    <path d="M9 15h6" />
                  </svg>
                  Resume
                </a>
              </Reveal>
            )}
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

      {/* footer hint */}
      <div className="relative max-w-4xl mx-auto px-4 mt-16 text-center">
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
  );
};

export default UserProfileView;

