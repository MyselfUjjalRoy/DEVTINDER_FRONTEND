import { useEffect, useMemo, useState, useCallback } from "react";
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

const StatTile = ({ icon, label, value, suffix = "" }) => (
  <div className="edge-card rounded-2xl p-4 sm:p-5 flex items-center gap-3.5">
    <span className="flex items-center justify-center w-11 h-11 rounded-xl bg-white/5 border border-white/10 text-primary shrink-0">
      {icon}
    </span>
    <div className="min-w-0">
      <p className="text-2xl font-black text-white leading-none">
        <CountUp to={typeof value === "number" ? value : 0} />
        {suffix}
      </p>
      <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-base-content/50 mt-1 truncate">
        {label}
      </p>
    </div>
  </div>
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
              style={{ boxShadow: `0 0 18px -6px ${st.glow}` }}
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
    { inset: 0, radius: 148, dur: 24, dir: "normal" },
    { inset: 30, radius: 118, dur: 16, dir: "reverse" },
    { inset: 58, radius: 90, dur: 30, dir: "normal" },
  ];

  const nodeIndex = (ringIdx) => [0, 2, 4][ringIdx];

  return (
    <div className="stack-orbit mx-auto my-8 relative">
      <span className="stack-orbit-halo" />
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

  const interests = useMemo(() => {
    const list = [];
    if (Array.isArray(profile?.hobbies)) list.push(...profile.hobbies.filter(Boolean));
    if (Array.isArray(profile?.likes)) list.push(...profile.likes.filter(Boolean));
    if (Array.isArray(profile?.dislikes)) list.push(...profile.dislikes.filter(Boolean));
    return list;
  }, [profile]);

  const glyph = GENDER_GLYPH[profile?.gender];
  const rel = RELATION_META[relationship] || RELATION_META.stranger;

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

  return (
    <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12 overflow-hidden">
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
        <span className="text-[11px] font-black uppercase tracking-[0.2em] text-base-content/40">
          Developer Profile
        </span>
      </div>

      <div className="relative space-y-6">
        {/* HERO */}
        <section className="premium-card rounded-[2rem] p-6 sm:p-8 fade-up relative overflow-hidden">
          <span className="chat-orb absolute -top-20 -left-20 w-56 h-56 rounded-full bg-primary/15 blur-3xl" />
          <span className="chat-orb absolute -bottom-24 -right-16 w-64 h-64 rounded-full bg-secondary/15 blur-3xl" style={{ animationDelay: "-5s" }} />

          <div className="relative flex flex-col md:flex-row gap-8">
            <div className="w-full md:w-60 shrink-0 flex flex-col items-center gap-4">
              <div className="relative">
                <div className="avatar-ring rounded-[1.75rem] p-[3px] shadow-2xl shadow-black/50">
                  <MediaImage
                    src={profile.photoURL}
                    alt={`${profile.firstName} ${profile.lastName || ""}`}
                    className="w-44 h-52 sm:w-52 sm:h-60 rounded-[calc(1.75rem-3px)] object-cover"
                  />
                </div>
                <span
                  title="Online"
                  className="absolute bottom-3 right-3 w-4 h-4 rounded-full bg-emerald-500 border-[3px] border-[#10121e] shadow-[0_0_12px_rgba(16,185,129,0.7)]"
                />
              </div>

              {allPhotos.length > 1 && (
                <div className="flex gap-2">
                  {allPhotos.map((p, i) => (
                    <div
                      key={i}
                      className={`group-photo w-14 h-16 rounded-xl overflow-hidden border ${
                        i === 0 ? "border-primary/50" : "border-white/10"
                      }`}
                    >
                      <MediaImage
                        src={p}
                        alt={`Photo ${i + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
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

              <div className="flex flex-wrap items-center gap-2.5 mt-3">
                <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-shimmer">
                  {profile.firstName} <span className="font-light">{profile.lastName}</span>
                </h1>
                {glyph && (
                  <span
                    title={profile.gender}
                    className={`flex items-center justify-center w-9 h-9 rounded-full bg-gradient-to-br ${glyph.tint} text-white text-lg font-bold`}
                  >
                    {glyph.symbol}
                  </span>
                )}
                {profile.age && (
                  <span className="px-2.5 py-1 rounded-lg bg-white/10 border border-white/10 text-sm font-black text-white">
                    {profile.age}
                  </span>
                )}
              </div>

              {headline && (
                <p className="mt-2 text-sm font-bold text-primary flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  {headline}
                </p>
              )}

              {(locationText || profile.isStudent !== undefined) && (
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
                  {profile.isStudent && (
                    <span className="inline-flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
                      </svg>
                      Student
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

              <p className="mt-4 text-sm text-base-content/75 leading-relaxed">
                {profile.about ||
                  "This developer hasn't written a bio yet."}
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                {renderActions()}
              </div>
            </div>
          </div>
        </section>

        {/* STATS */}
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-4 fade-up" style={{ animationDelay: "120ms" }}>
          <StatTile
            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>}
            label="Age"
            value={profile.age || 0}
          />
          <StatTile
            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>}
            label="Experience"
            value={profile.work?.experienceYears || 0}
            suffix="+"
          />
          <StatTile
            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>}
            label="Skills"
            value={skillList.length}
          />
          <StatTile
            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9zm9 7a3 3 0 100-6 3 3 0 000 6z" /></svg>}
            label="Photos"
            value={allPhotos.length}
          />
        </section>

        {/* TECH STACK */}
        <section className="premium-card rounded-[2rem] p-6 sm:p-8 fade-up relative overflow-hidden" style={{ animationDelay: "200ms" }}>
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

        {/* EDUCATION & WORK */}
        <section className="grid md:grid-cols-2 gap-4 fade-up" style={{ animationDelay: "280ms" }}>
          <div className="premium-card rounded-3xl p-6">
            <SectionTitle
              icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" /></svg>}
            >
              Education
            </SectionTitle>
            {profile.education?.college || profile.education?.degree ? (
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/25 text-indigo-300 shrink-0">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                  </span>
                  <div className="min-w-0">
                    <p className="font-black text-white">{profile.education.college || "University"}</p>
                    <p className="text-xs text-base-content/60 mt-0.5">
                      {[profile.education.degree, profile.education.passingYear ? `Class of ${profile.education.passingYear}` : null]
                        .filter(Boolean)
                        .join(" · ") || "Degree not specified"}
                    </p>
                  </div>
                </div>
                {typeof profile.education.cgpa === "number" && (
                  <div>
                    <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-base-content/50 mb-1.5">
                      <span>CGPA</span>
                      <span className="text-primary">{profile.education.cgpa.toFixed(2)} / 10</span>
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

          <div className="premium-card rounded-3xl p-6">
            <SectionTitle
              icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>}
            >
              Work
            </SectionTitle>
            {profile.work?.company || profile.work?.role ? (
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/25 text-emerald-300 shrink-0">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                  </span>
                  <div className="min-w-0">
                    <p className="font-black text-white">{profile.work.role || "Software Engineer"}</p>
                    {profile.work.company && (
                      <p className="text-xs text-base-content/60 mt-0.5">@ {profile.work.company}</p>
                    )}
                  </div>
                </div>
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
              </div>
            ) : (
              <p className="text-sm text-base-content/50">Work details not shared.</p>
            )}
          </div>
        </section>

        {/* INTERESTS */}
        {interests.length > 0 && (
          <section className="premium-card rounded-[2rem] p-6 sm:p-8 fade-up" style={{ animationDelay: "340ms" }}>
            <SectionTitle
              icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>}
            >
              Interests
            </SectionTitle>
            <div className="flex flex-wrap gap-2">
              {interests.map((item, i) => (
                <span
                  key={i}
                  className="pill-in inline-flex items-center px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-slate-200"
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  {item}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* PHOTOS */}
        {allPhotos.length > 1 && (
          <section className="fade-up" style={{ animationDelay: "400ms" }}>
            <SectionTitle
              icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9zm9 7a3 3 0 100-6 3 3 0 000 6z" /></svg>}
            >
              Photos
            </SectionTitle>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {allPhotos.map((p, i) => (
                <div key={i} className="group-photo relative h-44 sm:h-56 rounded-2xl overflow-hidden border border-white/10">
                  <MediaImage src={p} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent pointer-events-none" />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* LINKS */}
        {(socialLinks.length > 0 || codingLinks.length > 0 || profile.resumeURL) && (
          <section className="premium-card rounded-[2rem] p-6 sm:p-8 fade-up" style={{ animationDelay: "460ms" }}>
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
