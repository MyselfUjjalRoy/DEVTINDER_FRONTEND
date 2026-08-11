import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import confetti from "canvas-confetti";
import { MembershipBadge } from "../utils/membershipUtils";
import { BASE_URL } from "../utils/constants";
import MediaImage from "./MediaImage";

const FLOAT_HEARTS = [
  { left: "6%", delay: "0s", duration: "6s", size: 18, opacity: 0.8 },
  { left: "18%", delay: "1.4s", duration: "7s", size: 13, opacity: 0.6 },
  { left: "31%", delay: "0.6s", duration: "6.5s", size: 22, opacity: 0.7 },
  { left: "44%", delay: "2.1s", duration: "7.5s", size: 15, opacity: 0.65 },
  { left: "57%", delay: "0.9s", duration: "6.8s", size: 20, opacity: 0.75 },
  { left: "69%", delay: "1.8s", duration: "7.2s", size: 14, opacity: 0.6 },
  { left: "81%", delay: "0.3s", duration: "6.2s", size: 18, opacity: 0.8 },
  { left: "92%", delay: "2.4s", duration: "7.8s", size: 12, opacity: 0.55 },
  { left: "12%", delay: "3s", duration: "8s", size: 11, opacity: 0.5 },
  { left: "52%", delay: "3.6s", duration: "8.5s", size: 24, opacity: 0.6 },
  { left: "37%", delay: "2.8s", duration: "7s", size: 13, opacity: 0.6 },
  { left: "76%", delay: "3.2s", duration: "6.6s", size: 15, opacity: 0.7 },
];

const getHeadline = (user) => {
  if (!user) return null;
  if (user.isStudent && user.education?.degree) return user.education.degree;
  if (user.work?.role) {
    return user.work.company
      ? `${user.work.role} @ ${user.work.company}`
      : user.work.role;
  }
  if (user.education?.degree) return user.education.degree;
  return null;
};

const getSkills = (user) => {
  if (!user?.skills) return [];
  const arr = Array.isArray(user.skills)
    ? user.skills
    : typeof user.skills === "string"
      ? user.skills.split(",").map((s) => s.trim())
      : [];
  return arr.filter(Boolean).slice(0, 3);
};

const fireConfetti = () => {
  try {
    const zIndex = 5000;
    const defaults = { origin: { y: 0.55 }, zIndex };

    function burst(particleRatio, opts) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(200 * particleRatio),
      });
    }

    burst(0.25, {
      spread: 26,
      startVelocity: 55,
      colors: ["#ff2d55", "#ff708a", "#bf5af2", "#ffffff"],
    });
    burst(0.2, {
      spread: 60,
      colors: ["#ff2d55", "#f43f5e", "#ffffff"],
    });
    burst(0.35, {
      spread: 100,
      decay: 0.91,
      scalar: 0.8,
    });
    burst(0.1, {
      spread: 120,
      startVelocity: 25,
      decay: 0.92,
      colors: ["#ff2d55", "#ffffff"],
      scalar: 1.2,
    });

    setTimeout(() => {
      confetti({
        particleCount: 26,
        spread: 130,
        shapes: ["heart"],
        scalar: 1.6,
        gravity: 0.55,
        decay: 0.9,
        colors: ["#ff2d55", "#ff708a", "#ffd60a", "#ffffff"],
        origin: { y: 0.5 },
        zIndex,
      });
    }, 350);

    const sideCannons = { zIndex, spread: 75, ticks: 70, gravity: 0.8, decay: 0.93, startVelocity: 32, colors: ["#ff2d55", "#ff708a", "#ffffff"] };
    const end = Date.now() + 1400;
    (function frame() {
      if (Date.now() > end) return;
      confetti({ ...sideCannons, particleCount: 2, angle: 60, origin: { x: 0, y: 0.7 } });
      confetti({ ...sideCannons, particleCount: 2, angle: 120, origin: { x: 1, y: 0.7 } });
      requestAnimationFrame(frame);
    })();
  } catch (e) {
    console.log("Match confetti error:", e);
  }
};

const MatchProfileCard = ({ user, entrance, rotation, delay, fallbackName }) => {
  if (!user) return null;
  const name = user.firstName || fallbackName || "User";
  const headline = getHeadline(user);
  const skills = getSkills(user);

  return (
    <div
      className={`${entrance} relative z-10 shrink-0`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div
        className="match-card-float"
        style={{ "--card-rot": `${rotation}deg` }}
      >
        <div className="relative w-36 h-48 sm:w-44 sm:h-60 rounded-2xl overflow-hidden shadow-2xl shadow-black/60 border border-white/15 bg-base-900">
          <MediaImage
            src={user.photoURL}
            alt={name}
            className="absolute inset-0 w-full h-full object-cover select-none"
            draggable={false}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/25 to-transparent pointer-events-none" />

          {user.isPremium && (
            <div className="absolute top-2 left-2 pointer-events-none">
              <MembershipBadge
                membershipType={user.membershipType}
                isPremium={user.isPremium}
                size="sm"
              />
            </div>
          )}

          <div className="absolute bottom-2.5 left-3 right-3 text-left pointer-events-none">
            <p className="text-sm sm:text-base font-black text-white leading-tight truncate drop-shadow-lg">
              {name}
              {user.age ? (
                <span className="font-light text-white/90 ml-1.5">{user.age}</span>
              ) : null}
            </p>
            {headline && (
              <p className="text-[10px] font-bold text-primary truncate mt-0.5">
                {headline}
              </p>
            )}
            {skills.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1.5">
                {skills.map((s, i) => (
                  <span
                    key={i}
                    className="bg-white/15 backdrop-blur-md border border-white/20 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-md"
                  >
                    {s}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const MatchOverlay = ({ matchData, onClose }) => {
  const navigate = useNavigate();
  const me = useSelector((store) => store.user);
  const sceneRef = useRef(null);
  const glareRef = useRef(null);

  const [icebreaker, setIcebreaker] = useState(null);

  useEffect(() => {
    if (matchData) {
      fireConfetti();
    }
  }, [matchData]);

  useEffect(() => {
    const users = Array.isArray(matchData?.users) ? matchData.users : [];
    const otherUser =
      users.find((u) => u && u._id !== me?._id) || users[0] || {};
    if (!otherUser._id) return;
    let cancelled = false;
    axios
      .get(`${BASE_URL}icebreaker/${otherUser._id}`, { withCredentials: true })
      .then((res) => {
        if (!cancelled && res.data?.data) setIcebreaker(res.data.data);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [matchData, me?._id]);

  useEffect(() => {
    if (!matchData) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [matchData, onClose]);

  if (!matchData) return null;

  const users = Array.isArray(matchData.users) ? matchData.users : [];
  const other =
    users.find((u) => u && u._id !== me?._id) || users[0] || {};
  const otherName = other.firstName || "your match";

  const handlePointerMove = (e) => {
    const el = sceneRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    el.style.transform = `rotateX(${(-py * 10).toFixed(2)}deg) rotateY(${(px * 10).toFixed(2)}deg)`;
    el.style.setProperty("--glare-x", `${((px + 0.5) * 100).toFixed(1)}%`);
    el.style.setProperty("--glare-y", `${((py + 0.5) * 100).toFixed(1)}%`);
    if (glareRef.current) glareRef.current.style.opacity = "1";
  };

  const handlePointerLeave = () => {
    const el = sceneRef.current;
    if (!el) return;
    el.style.transform = "rotateX(0deg) rotateY(0deg)";
    if (glareRef.current) glareRef.current.style.opacity = "0";
  };

  const handleMessage = () => {
    onClose();
    if (other._id) navigate(`/chat/${other._id}`);
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center overflow-hidden bg-black/85 backdrop-blur-xl animate-fade-in [perspective:1200px]">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-32 -left-24 w-[28rem] h-[28rem] rounded-full bg-rose-600/20 blur-[140px] animate-pulse" />
        <div className="absolute -bottom-32 -right-24 w-[28rem] h-[28rem] rounded-full bg-purple-600/20 blur-[140px] animate-pulse" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[24rem] h-[24rem] rounded-full bg-pink-500/10 blur-[120px]" />
      </div>

      <div className="absolute inset-0 pointer-events-none">
        {FLOAT_HEARTS.map((h, i) => (
          <span
            key={i}
            className="float-heart"
            style={{
              left: h.left,
              width: h.size,
              height: h.size,
              opacity: h.opacity,
              animationDelay: h.delay,
              animationDuration: h.duration,
            }}
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full text-rose-500/70">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          </span>
        ))}
      </div>

      <button
        onClick={onClose}
        aria-label="Close"
        className="absolute top-5 right-5 z-[90] w-10 h-10 rounded-full bg-white/5 border border-white/10 text-slate-300 hover:bg-white/15 hover:text-white hover:rotate-90 transition-all duration-300 flex items-center justify-center"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <div
        ref={sceneRef}
        className="relative w-full max-w-lg px-4 sm:px-6 py-10 text-center will-change-transform transition-transform duration-200 ease-out"
        onMouseMove={handlePointerMove}
        onMouseLeave={handlePointerLeave}
      >
        <div ref={glareRef} className="match-scene-glare" />

        <div className="relative space-y-7" style={{ transformStyle: "preserve-3d" }}>
          <div className="space-y-2.5">
            <div className="flex justify-center items-center gap-1.5 text-rose-500">
              <span className="w-12 h-px bg-gradient-to-r from-transparent to-rose-500/60" />
              <span className="animate-heartbeat inline-block text-lg">💘</span>
              <span className="w-12 h-px bg-gradient-to-l from-transparent to-rose-500/60" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white flex justify-center flex-wrap">
              {"It's a Match!".split("").map((ch, i) => (
                <span
                  key={i}
                  className="match-letter bg-gradient-to-br from-rose-400 via-pink-400 to-purple-400 bg-clip-text text-transparent drop-shadow-[0_4px_18px_rgba(255,45,85,0.35)]"
                  style={{ animationDelay: `${200 + i * 45}ms` }}
                >
                  {ch === " " ? "\u00A0" : ch}
                </span>
              ))}
            </h1>
            <p
              className="text-xs sm:text-sm text-base-content/75 fade-in"
              style={{ animationDelay: "0.9s" }}
            >
              You found a match with{" "}
              <span className="font-black text-white">{otherName}</span> — say
              hi and start building together.
            </p>
          </div>

          {icebreaker && (
            <div
              className="mx-auto max-w-md rounded-2xl border border-white/10 bg-white/[0.05] backdrop-blur-xl px-4 py-3 text-left fade-in"
              style={{ animationDelay: "1s" }}
            >
              <div className="flex items-center gap-1.5 mb-1">
                <svg className="w-3.5 h-3.5 text-rose-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l1.9 5.1L19 9l-5.1 1.9L12 16l-1.9-5.1L5 9l5.1-1.9L12 2zm6 12l.95 2.55L21.5 17l-2.55.95L18 20.5l-.95-2.55L14.5 17l2.55-.95L18 14zM5 15l.7 1.8L7.5 17.5l-1.8.7L5 20l-.7-1.8L2.5 17.5l1.8-.7L5 15z" />
                </svg>
                <span className="text-[9px] font-black uppercase tracking-[0.18em] text-rose-400">
                  Icebreaker
                </span>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed">{icebreaker.text}</p>
            </div>
          )}

          <div className="relative flex items-center justify-center gap-3 sm:gap-6 pt-2">
            <MatchProfileCard
              user={me}
              entrance="match-card-left"
              rotation={-10}
              delay={250}
              fallbackName="You"
            />
            <MatchProfileCard
              user={other}
              entrance="match-card-right"
              rotation={10}
              delay={350}
            />

            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
              <div className="relative w-16 h-16 flex items-center justify-center">
                <span className="match-ring" />
                <span className="match-ring" style={{ animationDelay: "0.5s" }} />
                <div className="relative w-12 h-12 rounded-full bg-gradient-to-tr from-rose-500 via-pink-500 to-purple-500 flex items-center justify-center shadow-2xl shadow-rose-500/40 border-2 border-white/20 animate-heartbeat">
                  <svg
                    className="w-6 h-6 text-white fill-current"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div
            className="flex items-center justify-center gap-3 pt-2 fade-in"
            style={{ animationDelay: "1.1s" }}
          >
            <button
              onClick={handleMessage}
              className="group flex items-center gap-2.5 px-7 py-3.5 rounded-2xl bg-gradient-to-r from-rose-500 via-pink-500 to-purple-500 text-white font-black text-xs uppercase tracking-wider shadow-xl shadow-rose-500/30 hover:shadow-rose-500/50 hover:scale-105 active:scale-95 transition-all"
            >
              <svg className="w-4 h-4 group-hover:-rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              Send a Message
            </button>
            {other?._id && (
              <button
                onClick={() => {
                  onClose();
                  navigate(`/user/${other._id}`);
                }}
                className="flex items-center gap-2.5 px-7 py-3.5 rounded-2xl border border-white/15 text-slate-200 font-bold text-xs uppercase tracking-wider hover:bg-white/10 hover:scale-105 active:scale-95 transition-all"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                View Profile
              </button>
            )}
            <button
              onClick={onClose}
              className="flex items-center gap-2.5 px-7 py-3.5 rounded-2xl border border-white/15 text-slate-200 font-bold text-xs uppercase tracking-wider hover:bg-white/10 hover:scale-105 active:scale-95 transition-all"
            >
              Keep Swiping
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MatchOverlay;
