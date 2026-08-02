import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { useSelector } from "react-redux";
import { BASE_URL, getProfileLink, resolveMediaUrl } from "../utils/constants";
import { getSkillStyle } from "../utils/skillStyles";
import {
  PlatformIcon,
  BRAND_COLORS,
  LINK_LABELS,
  CODING_PLATFORMS,
} from "../utils/profileLinks";
import { MembershipBadge } from "../utils/membershipUtils";
import MediaImage from "./MediaImage";

const GENDER_GLYPH = {
  Male: { symbol: "♂", tint: "from-sky-400 to-blue-600", text: "text-sky-400" },
  Female: { symbol: "♀", tint: "from-pink-400 to-rose-600", text: "text-pink-400" },
  Others: { symbol: "⚧", tint: "from-violet-400 to-purple-600", text: "text-violet-400" },
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

const SectionTitle = ({ icon, children }) => (
  <div className="flex items-center gap-3 mb-6">
    <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 border border-primary/25 text-primary shrink-0">
      {icon}
    </span>
    <h2 className="text-lg sm:text-xl font-black tracking-tight text-white uppercase tracking-wider">
      {children}
    </h2>
    <span className="flex-1 h-px bg-gradient-to-r from-primary/40 to-transparent" />
  </div>
);

const RingGauge = ({ pct, children, color = "#ff2d55", size = 92, ringW = 7 }) => (
  <div className="relative shrink-0" style={{ width: size, height: size }}>
    <div
      className="ring-gauge absolute inset-0"
      style={{ "--ring-p": `${pct}%`, "--ring-color": color, "--ring-w": `${ringW}px` }}
    />
    <div
      className="absolute rounded-full bg-[#0c0e19]/85 backdrop-blur flex flex-col items-center justify-center text-center overflow-hidden"
      style={{ inset: ringW + 2 }}
    >
      {children}
    </div>
  </div>
);

const StatTile = ({ children, label }) => (
  <div className="edge-card rounded-2xl p-5 flex flex-col items-center justify-center gap-3 text-center">
    {children}
    <p className="text-[10px] font-black uppercase tracking-[0.16em] text-base-content/50">{label}</p>
  </div>
);

const TiltPhoto = ({ src, alt, name, meta }) => {
  const ref = useRef(null);
  const [t, setT] = useState({});
  const onMove = (e) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    setT({
      transform: `perspective(1100px) rotateY(${px * 13}deg) rotateX(${-py * 13}deg) translateY(-4px) scale(1.02)`,
      boxShadow: `${px * 24}px ${py * 24}px 46px -18px rgba(255, 45, 85, 0.5)`,
    });
  };
  const reset = () => setT({});

  return (
    <div className="profile-tilt-wrap relative" onMouseMove={onMove} onMouseLeave={reset}>
      <div
        ref={ref}
        className="profile-tilt avatar-ring rounded-[1.9rem] p-[3px] shadow-2xl shadow-black/50 relative breath-glow"
        style={{ "--bglow": "rgba(255,45,85,0.55)", ...t }}
      >
        <div className="relative rounded-[calc(1.9rem-3px)] overflow-hidden">
          <MediaImage
            src={src}
            alt={alt}
            className="w-56 h-64 sm:w-64 sm:h-72 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />
          <div className="profile-tilt-glare" />
          <div className="absolute bottom-0 inset-x-0 p-3.5 flex items-end justify-between gap-2">
            <div className="min-w-0">
              <p className="text-sm font-black text-white truncate">{name}</p>
              {meta && <p className="text-[10px] font-bold text-white/60">{meta}</p>}
            </div>
            <span className="font-mono text-[8px] font-bold tracking-[0.2em] text-white/50 shrink-0">
              DEV-ID
            </span>
          </div>
        </div>
      </div>
      <span
        title="Online"
        className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-[3px] border-[#10121e] shadow-[0_0_14px_rgba(16,185,129,0.8)] z-30"
      />
    </div>
  );
};

const FloatChip = ({ children, style, className = "" }) => (
  <span
    className={`profile-chip hidden md:inline-flex items-center gap-1 px-3 py-1.5 rounded-full border text-[10px] font-black tracking-wide bg-[#0d0f1a]/90 backdrop-blur ${className}`}
    style={style}
  >
    {children}
  </span>
);

const SkillMarqueeRow = ({ skills, reverse = false }) => {
  const doubled = [...skills, ...skills];
  return (
    <div className="stack-marquee-mask overflow-hidden py-1">
      <div className={`stack-marquee-track ${reverse ? "stack-marquee--rev" : ""}`}>
        {doubled.map((s, i) => {
          const st = getSkillStyle(s);
          return (
            <span
              key={`${s}-${i}`}
              className={`inline-flex items-center gap-1.5 shrink-0 px-4 py-2 rounded-full border text-[13px] font-bold ${st.bg} ${st.text} ${st.border} stack-pill-glow`}
              style={{ boxShadow: `0 0 18px -6px ${st.glow}`, "--bglow": st.glow }}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
              {s}
            </span>
          );
        })}
      </div>
    </div>
  );
};

const StackOrbit = ({ skills }) => {
  if (!skills.length) return null;
  const nodes = skills.slice(0, 6);

  const rings = [
    { inset: 0, radius: 148, dur: 26, dir: "normal" },
    { inset: 30, radius: 118, dur: 18, dir: "reverse" },
    { inset: 58, radius: 90, dur: 34, dir: "normal" },
  ];

  const nodeIndex = (ringIdx) => [0, 2, 4][ringIdx];

  const dust = [
    { odur: "17s", odr: "132px", odc: "#22d3ee" },
    { odur: "23s", odr: "102px", odc: "#fbbf24" },
    { odur: "29s", odr: "72px", odc: "#34d399" },
    { odur: "13s", odr: "150px", odc: "#a78bfa" },
    { odur: "19s", odr: "84px", odc: "#ff2d55" },
  ];

  return (
    <div className="stack-orbit mx-auto my-8 relative">
      <span className="stack-orbit-halo" />
      {dust.map((d, i) => (
        <span key={i} className="orbit-dot" style={d}>
          <i />
        </span>
      ))}
      {rings.map((ring, r) => {
        const a = nodes[nodeIndex(r)];
        const b = nodes[nodeIndex(r) + 1];
        return (
          <div
            key={r}
            className="stack-orbit-ring"
            style={{
              inset: ring.inset,
              "--orbit-dur": `${ring.dur}s`,
              "--orbit-radius": `${ring.radius}px`,
              animationDirection: ring.dir,
            }}
          >
            <div className="stack-orbit-node" style={{ "--orbit-rot": "0deg" }}>
              {a && <span className="stack-orbit-pill">{a}</span>}
            </div>
            <div className="stack-orbit-node" style={{ "--orbit-rot": "180deg" }}>
              {b && <span className="stack-orbit-pill">{b}</span>}
            </div>
          </div>
        );
      })}
      <div className="stack-orbit-core">
        <span className="stack-orbit-core-inner">
          {"</>"}
        </span>
        <span className="stack-orbit-core-label">TECH STACK</span>
      </div>
    </div>
  );
};

const Pill = ({ children, className = "" }) => (
  <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full border text-[11px] font-bold ${className}`}>
    {children}
  </span>
);

const InterestGroup = ({ icon, title, tint, items, kind }) => {
  if (!items.length) return null;
  const chipCls = {
    hobby: "interest-hobby border-amber-400/30 bg-amber-500/10 text-amber-100",
    like: "interest-like border-emerald-400/30 bg-emerald-500/10 text-emerald-100",
    dislike: "interest-dislike border-rose-400/30 bg-rose-500/10 text-rose-100",
  }[kind];

  const iconMark = {
    hobby: <span className="text-amber-300">✦</span>,
    like: <span className="interest-heart text-emerald-300">♥</span>,
    dislike: <span className="text-rose-300">✕</span>,
  }[kind];

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <span className={`flex items-center justify-center w-8 h-8 rounded-lg ${tint} border border-white/10 text-white text-sm`}>
          {icon}
        </span>
        <h3 className="text-xs font-black uppercase tracking-[0.18em] text-base-content/60">
          {title}
        </h3>
        <span className="text-[10px] font-black text-base-content/30">{items.length}</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {items.map((item, i) => (
          <span
            key={`${kind}-${i}`}
            className={`pill-in inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold ${chipCls}`}
            style={{ animationDelay: `${i * 70}ms` }}
          >
            {iconMark}
            {item}
          </span>
        ))}
      </div>
    </div>
  );
};

const UserProfileView = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const me = useSelector((store) => store.user);

  const [profile, setProfile] = useState(null);
  const [relationship, setRelationship] = useState("stranger");
  const [requestId, setRequestId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const [activePhoto, setActivePhoto] = useState(0);

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

  const activeImg = allPhotos[Math.min(activePhoto, Math.max(allPhotos.length - 1, 0))];

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

  const completion = useMemo(() => {
    if (!profile) return 0;
    const checks = [
      profile.photoURL,
      profile.about,
      profile.skills?.length,
      profile.location?.city,
      profile.gender,
      profile.age || profile.dob,
      profile.education?.college,
      profile.education?.degree,
      profile.work?.company,
      profile.work?.role,
      profile.github,
      profile.linkedin,
      profile.portfolio,
      profile.hobbies?.length,
      profile.likes?.length,
    ];
    return Math.round((checks.filter(Boolean).length / checks.length) * 100);
  }, [profile]);

  const glyph = GENDER_GLYPH[profile?.gender];
  const rel = RELATION_META[relationship] || RELATION_META.stranger;
  const dobText = formatDob(profile?.dob);
  const zodiac = zodiacFromDob(profile?.dob);
  const level = careerLevel(profile?.work?.experienceYears);

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
    if (relationship === "self") {
      return (
        <>
          <Link
            to="/profile"
            className="btn btn-primary btn-shine bg-gradient-to-r from-primary to-secondary border-none text-white rounded-2xl h-11 px-6 font-black text-xs uppercase tracking-wider shadow-lg shadow-primary/30 hover:scale-105 transition-all"
          >
            Edit Profile
          </Link>
          {!profile?.isPremium && (
            <Link
              to="/premium"
              className="btn btn-outline border-amber-400/40 text-amber-300 hover:bg-amber-500/10 rounded-2xl h-11 px-6 font-black text-xs uppercase tracking-wider"
            >
              Go Pro
            </Link>
          )}
        </>
      );
    }

    if (relationship === "connection") {
      return (
        <>
          <Link
            to={`/chat/${userId}`}
            className="btn btn-primary btn-shine bg-gradient-to-r from-primary to-secondary border-none text-white rounded-2xl h-11 px-6 font-black text-xs uppercase tracking-wider shadow-lg shadow-primary/30 hover:scale-105 transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            Message
          </Link>
          {profile?.resumeURL && (
            <a
              href={resolveMediaUrl(profile.resumeURL)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline border-white/15 text-slate-200 hover:bg-white/10 rounded-2xl h-11 px-6 font-black text-xs uppercase tracking-wider"
            >
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
            className="btn btn-primary bg-gradient-to-r from-emerald-500 to-teal-400 border-none text-white rounded-2xl h-11 px-6 font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/30 hover:scale-105 disabled:opacity-50 disabled:scale-100 transition-all"
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
        <Pill className="border-emerald-400/40 bg-emerald-500/10 text-emerald-300">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          Request Sent
        </Pill>
      );
    }

    if (relationship === "ignored") {
      return (
        <Pill className="border-white/15 bg-white/5 text-slate-400">
          Passed
        </Pill>
      );
    }

    return (
      <>
        <button
          onClick={() => sendRequest("interested")}
          disabled={busy}
          className="btn btn-primary btn-shine bg-gradient-to-r from-primary to-secondary border-none text-white rounded-2xl h-11 px-6 font-black text-xs uppercase tracking-wider shadow-lg shadow-primary/30 hover:scale-105 disabled:opacity-50 disabled:scale-100 transition-all"
        >
          Connect
        </button>
        <button
          onClick={() => sendRequest("ignored")}
          disabled={busy}
          className="btn btn-outline border-white/15 text-slate-200 hover:bg-white/10 rounded-2xl h-11 px-6 font-black text-xs uppercase tracking-wider disabled:opacity-50"
        >
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

  const floatingChips = skillList.slice(0, 4);

  return (
    <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 overflow-hidden">
      <div className="aurora-blob w-96 h-96 bg-rose-500/[0.20] -top-24 -left-24" />
      <div className="aurora-blob w-80 h-80 bg-indigo-500/[0.16] top-44 -right-24" style={{ animationDelay: "-7s" }} />
      <div className="aurora-blob w-72 h-72 bg-fuchsia-500/[0.12] bottom-24 left-1/3" style={{ animationDelay: "-14s" }} />

      {/* Back bar */}
      <div className="relative mb-6 fade-up flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 bg-white/5 text-slate-200 text-xs font-bold hover:bg-white/10 hover:scale-105 active:scale-95 transition-all"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
        <span className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-base-content/40">
          dev/<span className="text-primary">profile</span>
        </span>
        {profile.membershipType && (
          <span className="ml-auto hidden sm:inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-base-content/40">
            <MembershipBadge membershipType={profile.membershipType} isPremium={profile.isPremium} size="sm" />
          </span>
        )}
      </div>

      <div className="relative space-y-6">
        {/* ══════════ HERO — IDENTITY CARD ══════════ */}
        <section className="premium-card rounded-[2rem] p-6 sm:p-8 fade-up relative overflow-hidden">
          <div className="chat-grid-bg absolute inset-0 opacity-60" />
          <span className="chat-orb absolute -top-20 -left-20 w-56 h-56 rounded-full bg-primary/15 blur-3xl" />
          <span className="chat-orb absolute -bottom-24 -right-16 w-64 h-64 rounded-full bg-secondary/15 blur-3xl" style={{ animationDelay: "-5s" }} />

          <div className="relative flex flex-col md:flex-row gap-10 md:gap-12">
            {/* Photo stage */}
            <div className="w-full md:w-72 shrink-0 flex flex-col items-center gap-4">
              <div className="relative px-2">
                <FloatChip
                  className="border-sky-400/30 text-sky-200 -right-10 top-6"
                  style={{ "--cdur": "7s", "--cdx": "10px", "--crot": "3deg", animationDelay: "-1s" }}
                >
                  {floatingChips[0] && (
                    <>
                      <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                      {floatingChips[0]}
                    </>
                  )}
                </FloatChip>
                <FloatChip
                  className="border-emerald-400/30 text-emerald-200 -left-12 top-24"
                  style={{ "--cdur": "8s", "--cdx": "-12px", "--crot": "-4deg", animationDelay: "-3s" }}
                >
                  {floatingChips[1] && (
                    <>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      {floatingChips[1]}
                    </>
                  )}
                </FloatChip>
                <FloatChip
                  className="border-fuchsia-400/30 text-fuchsia-200 -right-12 bottom-20"
                  style={{ "--cdur": "9s", "--cdx": "9px", "--crot": "2deg", animationDelay: "-5s" }}
                >
                  {floatingChips[2] && (
                    <>
                      <span className="w-1.5 h-1.5 rounded-full bg-fuchsia-400" />
                      {floatingChips[2]}
                    </>
                  )}
                </FloatChip>
                <FloatChip
                  className="border-amber-400/30 text-amber-200 -left-10 bottom-8"
                  style={{ "--cdur": "7.5s", "--cdx": "-9px", "--crot": "-3deg", animationDelay: "-2s" }}
                >
                  {floatingChips[3] && (
                    <>
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                      {floatingChips[3]}
                    </>
                  )}
                </FloatChip>

                <TiltPhoto
                  src={activeImg || profile.photoURL}
                  alt={`${profile.firstName} ${profile.lastName || ""}`}
                  name={`${profile.firstName} ${profile.lastName || ""}`}
                  meta={[profile.age ? `${profile.age} yrs` : null, locationText].filter(Boolean).join(" · ") || "Developer"}
                />
              </div>

              {allPhotos.length > 1 && (
                <div className="flex gap-2.5 mt-1">
                  {allPhotos.map((p, i) => (
                    <button
                      key={i}
                      onClick={() => setActivePhoto(i)}
                      title={`Photo ${i + 1}`}
                      className={`group-photo relative w-16 h-[4.25rem] rounded-xl overflow-hidden border-2 transition-all duration-300 hover:-translate-y-1 ${
                        i === activePhoto
                          ? "border-primary/70 shadow-[0_0_16px_-4px_rgba(255,45,85,0.7)] scale-105"
                          : "border-white/10 hover:border-white/30"
                      }`}
                    >
                      <MediaImage src={p} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
                      {i === activePhoto && (
                        <span className="absolute bottom-1 right-1 w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_rgba(255,45,85,0.9)]" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Identity */}
            <div className="flex-1 min-w-0 relative">
              <div className="flex flex-wrap items-center gap-2.5">
                <Pill className={rel.cls}>
                  {relationship === "connection" && (
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                  {rel.label}
                </Pill>
                <MembershipBadge membershipType={profile.membershipType} isPremium={profile.isPremium} size="sm" />
              </div>

              <div className="flex flex-wrap items-center gap-3 mt-3">
                <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-shimmer">
                  {profile.firstName} <span className="font-light">{profile.lastName}</span>
                </h1>
                {glyph && (
                  <span
                    title={profile.gender}
                    className={`breath-glow flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br ${glyph.tint} text-white text-lg font-bold`}
                    style={{ "--bglow": "rgba(255,45,85,0.5)" }}
                  >
                    {glyph.symbol}
                  </span>
                )}
              </div>

              {/* identity chips — age shown differently */}
              <div className="flex flex-wrap items-stretch gap-3 mt-4">
                {ageNumber > 0 && (
                  <div className="id-chip flex items-center gap-3 rounded-2xl bg-white/5 border border-white/10 px-4 py-2.5" style={{ animationDelay: "80ms" }}>
                    <span className="text-3xl font-black text-white leading-none">
                      {ageNumber}
                      <span className="ml-1 text-[10px] font-black text-base-content/50 align-baseline">yrs</span>
                    </span>
                    <div className="w-px h-8 bg-white/10" />
                    <div>
                      <p className="text-[8px] font-black uppercase tracking-[0.2em] text-base-content/45">Born</p>
                      <p className="text-[11px] font-black text-primary">
                        {dobText ? dobText.replace(/^\d+\s+/, "") : "Not shared"}
                      </p>
                    </div>
                  </div>
                )}
                {zodiac && (
                  <div className="id-chip flex items-center gap-2.5 rounded-2xl bg-violet-500/10 border border-violet-400/25 px-4 py-2.5" style={{ animationDelay: "160ms" }}>
                    <span className="text-xl leading-none">{zodiac.split(" ")[0]}</span>
                    <div>
                      <p className="text-[8px] font-black uppercase tracking-[0.2em] text-violet-300/60">Zodiac</p>
                      <p className="text-[11px] font-black text-violet-200">{zodiac.split(" ").slice(1).join(" ")}</p>
                    </div>
                  </div>
                )}
                {profile.isStudent !== undefined && (
                  <div className="id-chip flex items-center gap-2.5 rounded-2xl bg-indigo-500/10 border border-indigo-400/25 px-4 py-2.5" style={{ animationDelay: "240ms" }}>
                    <svg className="w-5 h-5 text-indigo-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
                    </svg>
                    <div>
                      <p className="text-[8px] font-black uppercase tracking-[0.2em] text-indigo-300/60">Status</p>
                      <p className="text-[11px] font-black text-indigo-200">{profile.isStudent ? "Student" : "Working"}</p>
                    </div>
                  </div>
                )}
              </div>

              {headline && (
                <p className="mt-4 text-sm font-bold text-primary flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  {headline}
                </p>
              )}

              {(locationText || profile.work?.experienceYears > 0) && (
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-2 text-xs font-semibold text-base-content/60">
                  {locationText && (
                    <span className="inline-flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {locationText}
                    </span>
                  )}
                  {profile.work?.experienceYears > 0 && (
                    <span className="inline-flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      {profile.work.experienceYears}+ yrs experience
                    </span>
                  )}
                </div>
              )}

              <div className="mt-6 flex flex-wrap items-center gap-3">
                {renderActions()}
              </div>

              {/* profile strength */}
              <div className="mt-7 max-w-md">
                <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-[0.18em] text-base-content/45 mb-1.5">
                  <span>Profile strength</span>
                  <span className="text-primary">
                    <CountUp to={completion} />%
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-primary via-secondary to-emerald-400 animate-grow-bar"
                    style={{ "--bar-w": `${completion}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════ STATS — RING GAUGES ══════════ */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 fade-up" style={{ animationDelay: "120ms" }}>
          <StatTile label="Age">
            <RingGauge pct={Math.min((ageNumber / 100) * 100, 100)} color="#ff2d55">
              <span className="text-2xl font-black text-white leading-none">
                <CountUp to={ageNumber} />
              </span>
              <span className="text-[9px] font-black uppercase tracking-widest text-base-content/50 mt-0.5">yrs</span>
            </RingGauge>
          </StatTile>
          <StatTile label="Experience">
            <RingGauge pct={Math.min((profile.work?.experienceYears || 0) / 30, 1) * 100} color="#34d399">
              <span className="text-2xl font-black text-white leading-none">
                <CountUp to={profile.work?.experienceYears || 0} />+
              </span>
              <span className="text-[9px] font-black uppercase tracking-widest text-base-content/50 mt-0.5">years</span>
            </RingGauge>
          </StatTile>
          <StatTile label="Skills">
            <div className="flex flex-col items-center gap-1.5">
              <span className="text-2xl font-black text-white leading-none">
                <CountUp to={skillList.length} />
              </span>
              <div className="w-16 h-1.5 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-sky-400 to-primary animate-grow-bar"
                  style={{ "--bar-w": `${Math.min((skillList.length / 20) * 100, 100)}%` }}
                />
              </div>
            </div>
          </StatTile>
          <StatTile label="Photos">
            <div className="flex flex-col items-center gap-1.5">
              <span className="text-2xl font-black text-white leading-none">
                <CountUp to={allPhotos.length} />
              </span>
              <div className="w-16 h-1.5 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-400 animate-grow-bar"
                  style={{ "--bar-w": `${Math.min((allPhotos.length / 4) * 100, 100)}%` }}
                />
              </div>
            </div>
          </StatTile>
        </section>

        {/* ══════════ ABOUT ══════════ */}
        {profile.about && (
          <section className="premium-card rounded-[2rem] p-6 sm:p-8 fade-up relative overflow-hidden" style={{ animationDelay: "180ms" }}>
            <span className="absolute top-5 left-6 font-serif text-6xl leading-none text-primary/25 select-none">"</span>
            <div className="pl-10 sm:pl-12">
              <SectionTitle icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>}>
                About
              </SectionTitle>
              <p className="text-sm sm:text-base text-base-content/80 leading-relaxed">{profile.about}</p>
            </div>
          </section>
        )}

        {/* ══════════ TECH STACK ══════════ */}
        <section className="premium-card rounded-[2rem] p-6 sm:p-8 fade-up relative overflow-hidden" style={{ animationDelay: "240ms" }}>
          <span className="chat-orb absolute -top-24 -right-20 w-64 h-64 rounded-full bg-sky-500/10 blur-3xl" />
          <SectionTitle
            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>}
          >
            Tech Stack
          </SectionTitle>

          {skillList.length === 0 ? (
            <p className="text-sm text-base-content/50 text-center py-8">
              No tech stack added yet.
            </p>
          ) : (
            <div className="relative">
              <StackOrbit skills={skillList} />
              <div className="space-y-2">
                <SkillMarqueeRow skills={skillList} />
                <SkillMarqueeRow skills={skillList.slice().reverse()} reverse />
              </div>
            </div>
          )}
        </section>

        {/* ══════════ WORK & EDUCATION TIMELINE ══════════ */}
        <section className="grid md:grid-cols-2 gap-4 fade-up" style={{ animationDelay: "300ms" }}>
          <div className="premium-card rounded-3xl p-6 relative overflow-hidden">
            <SectionTitle
              icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>}
            >
              Work Experience
            </SectionTitle>
            {profile.work?.company || profile.work?.role ? (
              <div className="relative pl-12">
                <span className="absolute left-[9px] top-1.5 w-4 h-4 rounded-full bg-emerald-400 border-[3px] border-[#10121e] shadow-[0_0_16px_rgba(52,211,153,0.8)] z-10" />
                <span className="timeline-grow absolute left-[15px] top-3 bottom-3 w-[2px] bg-gradient-to-b from-emerald-400/70 via-emerald-400/25 to-transparent" />

                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-black text-white">{profile.work.role || "Software Engineer"}</h3>
                  {level && (
                    <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-400/30 text-[9px] font-black uppercase tracking-wider text-emerald-300">
                      {level}
                    </span>
                  )}
                </div>
                {profile.work.company && (
                  <p className="text-xs text-base-content/60 mt-1 flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 21h18M5 21V7l7-4 7 4v14M9 9h.01M15 9h.01M9 13h.01M15 13h.01M9 17h.01M15 17h.01" />
                    </svg>
                    {profile.work.company}
                  </p>
                )}
                {typeof profile.work.experienceYears === "number" && profile.work.experienceYears > 0 && (
                  <div className="mt-4">
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
              </div>
            ) : (
              <p className="text-sm text-base-content/50">Work details not shared.</p>
            )}
          </div>

          <div className="premium-card rounded-3xl p-6 relative overflow-hidden">
            <SectionTitle
              icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" /></svg>}
            >
              Education
            </SectionTitle>
            {profile.education?.college || profile.education?.degree ? (
              <div className="relative pl-12">
                <span className="absolute left-[9px] top-1.5 w-4 h-4 rounded-full bg-indigo-400 border-[3px] border-[#10121e] shadow-[0_0_16px_rgba(129,140,248,0.8)] z-10" />
                <span className="timeline-grow absolute left-[15px] top-3 bottom-3 w-[2px] bg-gradient-to-b from-indigo-400/70 via-indigo-400/25 to-transparent" style={{ animationDelay: "0.15s" }} />

                <h3 className="font-black text-white">{profile.education.college || "University"}</h3>
                <div className="flex flex-wrap items-center gap-2 mt-1.5">
                  {profile.education.degree && (
                    <span className="px-2 py-0.5 rounded-md bg-indigo-500/15 border border-indigo-400/30 text-[9px] font-black uppercase tracking-wider text-indigo-300">
                      {profile.education.degree}
                    </span>
                  )}
                  {profile.education.passingYear && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-base-content/55">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Class of {profile.education.passingYear}
                    </span>
                  )}
                </div>
                {typeof profile.education.cgpa === "number" && (
                  <div className="mt-4">
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
              </div>
            ) : (
              <p className="text-sm text-base-content/50">Education details not shared.</p>
            )}
          </div>
        </section>

        {/* ══════════ INTERESTS — DISTINCT ANIMATIONS ══════════ */}
        {(hobbies.length > 0 || likes.length > 0 || dislikes.length > 0) && (
          <section className="premium-card rounded-[2rem] p-6 sm:p-8 fade-up space-y-6" style={{ animationDelay: "360ms" }}>
            <SectionTitle
              icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>}
            >
              Personality
            </SectionTitle>

            <InterestGroup
              kind="hobby"
              title="Hobbies"
              icon={<svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l2.4 6.2L21 8l-5 4.4 1.8 6.8L12 15.6 6.2 19.2 8 12.4 3 8l6.6.2L12 2z" /></svg>}
              tint="bg-amber-500/15"
              items={hobbies}
            />
            <InterestGroup
              kind="like"
              title="Likes"
              icon={<svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" /></svg>}
              tint="bg-emerald-500/15"
              items={likes}
            />
            <InterestGroup
              kind="dislike"
              title="Dislikes"
              icon={<svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2a10 10 0 100 20 10 10 0 000-20zm3.71 13.29a1 1 0 01-1.42 0L12 12.41l-2.29 2.88a1 1 0 11-1.42-1.42L10.59 11l-2.3-2.87a1 1 0 111.42-1.42L12 9.59l2.29-2.88a1 1 0 011.42 1.42L13.41 11l2.3 2.87a1 1 0 010 1.42z" /></svg>}
              tint="bg-rose-500/15"
              items={dislikes}
            />
          </section>
        )}

        {/* ══════════ PHOTOS — POLAROID ══════════ */}
        {allPhotos.length > 1 && (
          <section className="fade-up" style={{ animationDelay: "420ms" }}>
            <SectionTitle
              icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9zm9 7a3 3 0 100-6 3 3 0 000 6z" /></svg>}
            >
              Photos
            </SectionTitle>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
              {allPhotos.map((p, i) => (
                <div
                  key={i}
                  className={`polaroid group-photo relative rounded-2xl overflow-hidden border border-white/10 shadow-xl shadow-black/40 ${
                    i % 2 === 0 ? "-rotate-1" : "rotate-1"
                  }`}
                >
                  <MediaImage src={p} alt={`Photo ${i + 1}`} className="w-full h-48 sm:h-60 object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
                  <div className="absolute bottom-0 inset-x-0 px-3 py-2 flex items-center justify-between">
                    <p className="text-[10px] font-black text-white/90">{profile.firstName}'s photo</p>
                    <span className="font-mono text-[8px] tracking-[0.2em] text-white/50">0{i + 1}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ══════════ LINKS ══════════ */}
        {(socialLinks.length > 0 || codingLinks.length > 0 || profile.resumeURL) && (
          <section className="premium-card rounded-[2rem] p-6 sm:p-8 fade-up" style={{ animationDelay: "480ms" }}>
            <SectionTitle
              icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 010 5.656l-2.828 2.828a4 4 0 01-5.657-5.657l1.414-1.414m9.657 1.414l-1.414 1.414a4 4 0 01-5.657 5.657" /></svg>}
            >
              Profiles & Links
            </SectionTitle>

            {socialLinks.length > 0 && (
              <div className="flex flex-wrap gap-2.5 mb-5">
                {socialLinks.map((l) => {
                  const href = getProfileLink(l.value.trim(), l.platform);
                  if (!href) return null;
                  return (
                    <a
                      key={l.platform}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ backgroundColor: l.platform === "portfolio" ? "#0ea5e9" : BRAND_COLORS[l.platform] }}
                      className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-white text-xs font-black uppercase tracking-wider shadow-md hover:scale-105 hover:shadow-xl active:scale-95 transition-all"
                    >
                      <PlatformIcon platform={l.platform} />
                      {LINK_LABELS[l.platform] || l.platform}
                    </a>
                  );
                })}
                {profile.resumeURL && (
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
                )}
              </div>
            )}

            {codingLinks.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {codingLinks.map((l) => {
                  const href = getProfileLink(l.value.trim(), l.platform);
                  if (!href) return null;
                  return (
                    <a
                      key={l.platform}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ backgroundColor: BRAND_COLORS[l.platform] }}
                      className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-white text-xs font-bold uppercase tracking-wider shadow-md hover:scale-105 hover:shadow-xl active:scale-95 transition-all"
                    >
                      <PlatformIcon platform={l.platform} />
                      {LINK_LABELS[l.platform] || l.platform}
                    </a>
                  );
                })}
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
};

export default UserProfileView;
