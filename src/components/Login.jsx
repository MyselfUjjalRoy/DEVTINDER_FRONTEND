import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { addUser } from "../utils/userSlice";
import { useNavigate, useSearchParams } from "react-router-dom";
import { BASE_URL } from "../utils/constants";
import confetti from "canvas-confetti";
import ConstellationBackground from "./ConstellationBackground";
import { useCountUp, useTypewriter } from "../utils/hooks";

const TAGLINES = [
  "Find your co-founder",
  "Pair program with a soulmate",
  "Ship side projects together",
  "Meet engineers who vibe with you",
];

const FEATURES = [
  {
    title: "Swipe through dev profiles",
    desc: "Meet engineers, hackers & founders who build like you.",
    gradient: "from-rose-500 to-pink-500",
    glow: "shadow-rose-500/30",
    icon: (
      <svg className="w-4 h-4 text-white fill-current" viewBox="0 0 24 24">
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
      </svg>
    ),
  },
  {
    title: "Chat in realtime",
    desc: "Socket-powered conversations with instant pair sessions.",
    gradient: "from-purple-500 to-indigo-500",
    glow: "shadow-purple-500/30",
    icon: (
      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
      </svg>
    ),
  },
  {
    title: "Verified gold badges",
    desc: "Trusted members get highlighted, boosted profiles.",
    gradient: "from-cyan-500 to-blue-500",
    glow: "shadow-cyan-500/30",
    icon: (
      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m9 12 2 2 4-4" />
      </svg>
    ),
  },
];

const STATS = [
  { end: 10, suffix: "K+", decimals: 0, label: "Developers" },
  { end: 45, suffix: "K+", decimals: 0, label: "Matches" },
  { end: 4.9, suffix: "", decimals: 1, label: "Community rating" },
];

const STRENGTH_META = [
  { label: "Too short", color: "#f87171", text: "text-red-400" },
  { label: "Weak", color: "#fbbf24", text: "text-amber-400" },
  { label: "Fair", color: "#fb923c", text: "text-orange-400" },
  { label: "Good", color: "#34d399", text: "text-emerald-400" },
  { label: "Strong", color: "#22d3ee", text: "text-cyan-400" },
];

const computeStrength = (pw) => {
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return Math.min(score, 4);
};

const Stat = ({ end, suffix = "", decimals = 0, label }) => {
  const value = useCountUp(end);
  return (
    <div>
      <p className="text-2xl font-black text-white bg-gradient-to-r from-rose-400 to-purple-400 bg-clip-text text-transparent">
        {value.toFixed(decimals)}
        {suffix}
      </p>
      <p className="text-[10px] uppercase tracking-widest text-white/50 mt-0.5">{label}</p>
    </div>
  );
};

const BrandMark = ({ size = "w-12 h-12" }) => (
  <div className={`${size} rounded-2xl bg-gradient-to-tr from-primary to-secondary p-0.5 shadow-lg shadow-primary/30 flex items-center justify-center`}>
    <div className="w-full h-full bg-base-950 rounded-[calc(1rem-2px)] flex items-center justify-center">
      <svg className="w-[55%] h-[55%] text-primary fill-current" viewBox="0 0 24 24">
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
      </svg>
    </div>
  </div>
);

const GoogleIcon = () => (
  <svg className="w-4 h-4 shrink-0" viewBox="0 0 48 48">
    <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/>
    <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"/>
    <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0124 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/>
    <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 01-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"/>
  </svg>
);

const InputShell = ({ icon, children, extraClass = "" }) => (
  <label
    className={`input input-bordered bg-base-900/60 border-white/10 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 focus-within:shadow-[0_0_0_4px_rgba(255,45,85,0.12),0_0_24px_-4px_rgba(255,45,85,0.4)] transition-all duration-300 flex items-center gap-2 rounded-xl ${extraClass}`}
  >
    {icon}
    {children}
  </label>
);

const fireWelcome = () => {
  try {
    confetti({
      particleCount: 130,
      spread: 80,
      startVelocity: 38,
      origin: { y: 0.6 },
      colors: ["#fb7185", "#f472b6", "#a78bfa", "#34d399", "#fbbf24"],
      zIndex: 9999,
    });
  } catch (err) {
    console.log(err);
  }
};

const Login = () => {
  const [emailId, setEmailId] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [isLoginForm, setIsLoginForm] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  const [toast, setToast] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const tiltRef = useRef(null);
  const glareRef = useRef(null);

  const typed = useTypewriter(TAGLINES);
  const strength = isLoginForm ? -1 : computeStrength(password);
  const strengthMeta = STRENGTH_META[Math.max(strength, 0)];

  const handleLogin = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await axios.post(
        BASE_URL + "login",
        { emailId, password },
        { withCredentials: true }
      );
      dispatch(addUser(res.data));
      setToast(true);
      fireWelcome();
      setTimeout(() => {
        setToast(false);
        return navigate("/feed");
      }, 1500);
    } catch (err) {
      setError(
        String(err?.response?.data || err?.message || "Login failed. Please check your credentials.")
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await axios.post(
        BASE_URL + "signup",
        { firstName, lastName, emailId, password },
        { withCredentials: true }
      );
      dispatch(addUser(res.data.data));
      setToast(true);
      fireWelcome();
      setTimeout(() => {
        setToast(false);
        return navigate("/profile");
      }, 1500);
    } catch (err) {
      console.log(err);
      setError(err?.response?.data || "Signup failed. Please check your details.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = () => {
    setError("");
    window.location.href = BASE_URL + "auth/google";
  };

  useEffect(() => {
    const auth = searchParams.get("googleAuth");
    if (!auth) return;
    const message = searchParams.get("message");
    const isNewUser = searchParams.get("newUser") === "1";

    // Clear the query string so a refresh doesn't re-trigger the flow.
    setSearchParams({}, { replace: true });

    if (auth === "error") {
      setError(message ? decodeURIComponent(message) : "Google sign-in failed. Please try again.");
      return;
    }

    if (auth === "success") {
      setLoading(true);
      axios
        .get(BASE_URL + "profile/view", { withCredentials: true })
        .then((res) => {
          dispatch(addUser(res.data));
          setToast(true);
          fireWelcome();
          setTimeout(() => {
            setToast(false);
            navigate(isNewUser ? "/profile" : "/feed");
          }, 1500);
        })
        .catch(() => {
          setError("Signed in with Google, but couldn't load your profile. Please try again.");
        })
        .finally(() => setLoading(false));
    }
  }, [searchParams, setSearchParams, dispatch, navigate]);

  const submit = () => (isLoginForm ? handleLogin() : handleSignUp());

  const handleTiltMove = (e) => {
    const el = tiltRef.current;
    if (!el) return;
    if (window.matchMedia("(hover: none)").matches) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    el.style.transform = `perspective(1100px) rotateX(${(-py * 4).toFixed(2)}deg) rotateY(${(px * 4).toFixed(2)}deg)`;
    el.style.setProperty("--glare-x", `${((px + 0.5) * 100).toFixed(1)}%`);
    el.style.setProperty("--glare-y", `${((py + 0.5) * 100).toFixed(1)}%`);
    if (glareRef.current) glareRef.current.style.opacity = "1";
  };

  const handleTiltLeave = () => {
    const el = tiltRef.current;
    if (!el) return;
    el.style.transform = "perspective(1100px) rotateX(0deg) rotateY(0deg)";
    if (glareRef.current) glareRef.current.style.opacity = "0";
  };

  return (
    <div className="relative min-h-[82vh] flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8 overflow-hidden">
      <ConstellationBackground />

      {/* Aurora blobs */}
      <div className="absolute top-10 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[130px] pointer-events-none animate-aurora"></div>
      <div className="absolute bottom-0 right-1/4 w-[28rem] h-96 bg-accent/15 rounded-full blur-[130px] pointer-events-none animate-aurora" style={{ animationDelay: "-5s" }}></div>
      <div className="absolute top-1/3 right-0 w-72 h-72 bg-secondary/15 rounded-full blur-[110px] pointer-events-none animate-aurora" style={{ animationDelay: "-10s" }}></div>

      {/* Futuristic grid floor */}
      <div className="grid-floor hidden lg:block"></div>

      <div className="w-full max-w-6xl relative z-10">
        <div
          ref={tiltRef}
          onMouseMove={handleTiltMove}
          onMouseLeave={handleTiltLeave}
          className="border-animated p-[1.5px] rounded-[2rem] shadow-[0_40px_120px_-40px_rgba(0,0,0,0.9)] transition-transform duration-150 ease-out will-change-transform"
        >
          <div className="glass-panel rounded-[calc(2rem-1.5px)] overflow-hidden relative grid lg:grid-cols-[1.05fr_1fr]">
            <div ref={glareRef} className="glare-overlay"></div>

            {/* ------- Welcome Panel (desktop) ------- */}
            <aside className="hidden lg:flex relative flex-col justify-between p-12 bg-gradient-to-br from-primary/20 via-primary/5 to-accent/10 overflow-hidden">
              <div className="absolute -top-24 -right-24 w-80 h-80 bg-secondary/30 rounded-full blur-[90px]"></div>
              <div className="absolute -bottom-32 -left-20 w-96 h-96 bg-primary/25 rounded-full blur-[100px]"></div>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.08),transparent_55%)]"></div>

              {/* floating match card */}
              <div className="absolute top-20 right-6 z-10 animate-float-y hidden xl:block">
                <div className="glass-card rounded-2xl p-4 border border-white/20 shadow-2xl flex items-center gap-3 rotate-6">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/30 animate-heartbeat">
                    <svg className="w-5 h-5 text-white fill-current" viewBox="0 0 24 24">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-black text-white">It's a match!</p>
                    <p className="text-[10px] text-white/60">Full-stack ✕ Frontend</p>
                  </div>
                </div>
              </div>

              {/* brand */}
              <div className="relative flex items-center gap-3 animate-slide-up">
                <BrandMark />
                <div>
                  <span className="text-2xl font-black tracking-tight text-white">DevTinder</span>
                  <p className="text-[10px] uppercase tracking-[0.3em] text-white/40">Next-gen dev matching</p>
                </div>
              </div>

              {/* headline */}
              <div className="relative space-y-6">
                <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/15 backdrop-blur-md text-[11px] font-bold text-white/80 uppercase tracking-widest animate-slide-up">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
                  </span>
                  Match • Code • Build • Repeat
                </span>

                <h1 className="text-4xl font-black tracking-tight leading-tight text-white animate-slide-up" style={{ animationDelay: "0.1s" }}>
                  Where developers find
                  <br />
                  their{" "}
                  <span className="bg-gradient-to-r from-rose-400 via-pink-400 to-purple-400 bg-clip-text text-transparent animate-gradient">
                    perfect match
                  </span>
                </h1>

                <div className="flex items-center text-sm font-bold text-white/85 min-h-[1.5rem] animate-slide-up" style={{ animationDelay: "0.2s" }}>
                  <span className="text-white/50 mr-2">›</span>
                  <span>{typed}</span>
                  <span className="typewriter-cursor"></span>
                </div>

                <div className="space-y-3 pt-2">
                  {FEATURES.map((f, i) => (
                    <div
                      key={f.title}
                      className="group flex items-start gap-3 p-2 -m-2 rounded-xl transition-colors hover:bg-white/5 animate-slide-up"
                      style={{ animationDelay: `${0.3 + i * 0.1}s` }}
                    >
                      <div
                        className={`mt-0.5 w-7 h-7 shrink-0 rounded-lg bg-gradient-to-tr ${f.gradient} ${f.glow} shadow-lg flex items-center justify-center`}
                      >
                        {f.icon}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">{f.title}</p>
                        <p className="text-xs text-white/60">{f.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* social proof */}
              <div className="relative">
                <div className="flex items-center gap-8 pt-6 border-t border-white/10 animate-slide-up" style={{ animationDelay: "0.6s" }}>
                  {STATS.map((s) => (
                    <Stat key={s.label} end={s.end} suffix={s.suffix} decimals={s.decimals} label={s.label} />
                  ))}
                </div>
                <div className="mt-6 glass-card rounded-2xl p-4 border border-white/15 animate-slide-up" style={{ animationDelay: "0.7s" }}>
                  <p className="text-xs text-white/85 italic leading-relaxed">
                    "Matched with my next co-founder in 48 hours. Best community for builders."
                  </p>
                  <p className="text-[11px] text-white/60 font-bold mt-2">— Priya, Backend Engineer</p>
                </div>
              </div>
            </aside>

            {/* ------- Auth Panel ------- */}
            <div className="p-8 sm:p-10 lg:p-12">
              {/* compact brand header (mobile/tablet) */}
              <div className="lg:hidden text-center mb-8 animate-slide-up">
                <div className="flex justify-center mb-3">
                  <BrandMark size="w-14 h-14" />
                </div>
                <h2 className="text-2xl font-black tracking-tight text-white">
                  {isLoginForm ? "Welcome Back" : "Join DevTinder"}
                </h2>
                <p className="text-xs text-base-content/60 mt-1 flex items-center justify-center gap-1">
                  <span className="text-white/40">›</span>
                  <span>{typed}</span>
                  <span className="typewriter-cursor"></span>
                </p>
              </div>

              {/* header (desktop) */}
              <div className="text-center mb-8 hidden lg:block animate-slide-up">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-400/10 border border-emerald-400/30 text-[10px] font-bold text-emerald-300 mb-4">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400"></span>
                  </span>
                  COMMUNITY LIVE NOW
                </div>
                <h2 className="text-3xl font-black tracking-tight text-white">
                  {isLoginForm ? "Welcome Back" : "Join DevTinder"}
                </h2>
                <p className="text-xs text-base-content/60 mt-1">
                  {isLoginForm
                    ? "Your matches are waiting — jump back in"
                    : "Create your developer profile & showcase your stack"}
                </p>
              </div>

              <>
              {/* Segmented Switcher */}
              <div className="relative flex bg-base-900/80 p-1 rounded-2xl border border-white/10 mb-8 animate-slide-up" style={{ animationDelay: "0.1s" }}>
                <span
                  className={`absolute top-1 bottom-1 left-1 w-[calc(50%-4px)] rounded-xl bg-gradient-to-r from-primary to-secondary shadow-lg shadow-primary/30 transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
                    isLoginForm ? "translate-x-0" : "translate-x-full"
                  }`}
                ></span>
                <button
                  className={`relative flex-1 py-2 rounded-xl text-xs font-black transition-colors z-10 ${
                    isLoginForm ? "text-white" : "text-base-content/60 hover:text-white"
                  }`}
                  onClick={() => {
                    setError("");
                    setIsLoginForm(true);
                  }}
                >
                  Sign In
                </button>
                <button
                  className={`relative flex-1 py-2 rounded-xl text-xs font-black transition-colors z-10 ${
                    !isLoginForm ? "text-white" : "text-base-content/60 hover:text-white"
                  }`}
                  onClick={() => {
                    setError("");
                    setIsLoginForm(false);
                  }}
                >
                  Register
                </button>
              </div>

              <div className="space-y-4">
                {!isLoginForm && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="form-control">
                      <label className="label py-1">
                        <span className="label-text text-[11px] font-bold uppercase tracking-wider text-base-content/70">First Name</span>
                      </label>
                      <InputShell
                        icon={<svg className="w-4 h-4 text-base-content/40 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>}
                      >
                        <input
                          type="text"
                          className="grow text-xs text-white placeholder-base-content/30 focus:outline-none"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && submit()}
                          required
                          placeholder="Ujjal"
                        />
                      </InputShell>
                    </div>

                    <div className="form-control">
                      <label className="label py-1">
                        <span className="label-text text-[11px] font-bold uppercase tracking-wider text-base-content/70">Last Name</span>
                      </label>
                      <InputShell
                        icon={<svg className="w-4 h-4 text-base-content/40 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>}
                      >
                        <input
                          type="text"
                          className="grow text-xs text-white placeholder-base-content/30 focus:outline-none"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && submit()}
                          required
                          placeholder="Roy"
                        />
                      </InputShell>
                    </div>
                  </div>
                )}

                <div className="form-control">
                  <label className="label py-1">
                    <span className="label-text text-[11px] font-bold uppercase tracking-wider text-base-content/70">Developer Email</span>
                  </label>
                  <InputShell
                    icon={<svg className="w-4 h-4 text-base-content/40 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>}
                  >
                    <input
                      type="email"
                      className="grow text-xs text-white placeholder-base-content/30 focus:outline-none"
                      value={emailId}
                      onChange={(e) => setEmailId(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && submit()}
                      required
                      placeholder="ujjal@example.com"
                    />
                  </InputShell>
                </div>

                <div className="form-control">
                  <label className="label py-1">
                    <span className="label-text text-[11px] font-bold uppercase tracking-wider text-base-content/70">Password</span>
                  </label>
                  <InputShell
                    extraClass="pr-2"
                    icon={<svg className="w-4 h-4 text-base-content/40 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>}
                  >
                    <input
                      type={showPassword ? "text" : "password"}
                      className="grow text-xs text-white placeholder-base-content/30 focus:outline-none bg-transparent"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && submit()}
                      required
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="p-1 rounded-lg text-base-content/40 hover:text-white hover:bg-white/10 transition-all duration-200 focus:outline-none"
                      tabIndex={-1}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </InputShell>

                  {/* Password strength meter */}
                  {!isLoginForm && password.length > 0 && (
                    <div className="mt-2.5 animate-slide-up">
                      <div className="flex gap-1.5">
                        {[1, 2, 3, 4].map((seg) => (
                          <div
                            key={seg}
                            className="h-1 flex-1 rounded-full transition-all duration-500"
                            style={{
                              background:
                                strength >= seg ? strengthMeta.color : "rgba(255,255,255,0.08)",
                              boxShadow: strength >= seg ? `0 0 8px ${strengthMeta.color}66` : "none",
                            }}
                          ></div>
                        ))}
                      </div>
                      <p className={`text-[10px] font-bold mt-1.5 ${strengthMeta.text}`}>
                        Password strength: {strengthMeta.label}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {error && (
                <div className="alert alert-error bg-error/15 border border-error/30 text-error rounded-xl text-xs py-3 px-4 flex items-center gap-2 mt-5">
                  <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <span>{error}</span>
                </div>
              )}

              <div className="mt-6">
                <button
                  className="btn btn-primary btn-shine w-full rounded-2xl h-12 font-black text-xs uppercase tracking-wider bg-gradient-to-r from-primary to-secondary border-none text-white hover:opacity-95 shadow-xl shadow-primary/25 hover:scale-[1.01] active:scale-95 transition-all"
                  onClick={submit}
                  disabled={loading}
                >
                  {loading ? (
                    <span className="loading loading-spinner loading-xs"></span>
                  ) : isLoginForm ? (
                    "Sign In to DevTinder"
                  ) : (
                    "Create Developer Profile"
                  )}
                </button>

                <div className="divider my-5 text-[10px] uppercase tracking-widest text-base-content/40">or continue with</div>

                <button
                  type="button"
                  onClick={handleGoogle}
                  disabled={loading}
                  className="btn btn-outline w-full rounded-2xl h-12 gap-3 border-white/15 bg-white/5 text-white hover:bg-white/10 hover:border-white/30 transition-all"
                >
                  {loading ? (
                    <span className="loading loading-spinner loading-xs"></span>
                  ) : (
                    <>
                      <GoogleIcon />
                      <span className="text-xs font-bold">Continue with Google</span>
                    </>
                  )}
                </button>

                <p className="text-[10px] text-base-content/40 text-center mt-4 flex items-center justify-center gap-1.5">
                  <svg className="w-3 h-3 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Free forever for developers • Encrypted & secure
                </p>
              </div>
                </>
            </div>
          </div>
        </div>
      </div>

      {toast && (
        <div className="toast toast-top toast-end z-[99] mt-16 p-4">
          <div className="alert bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-2xl shadow-xl border border-emerald-400 font-bold text-xs flex items-center gap-2">
            <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>{isLoginForm ? "Welcome back! Redirecting to feed..." : "Account created! Setting up profile..."}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
