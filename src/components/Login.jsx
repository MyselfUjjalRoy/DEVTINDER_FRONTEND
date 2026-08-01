import { useState } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { addUser } from "../utils/userSlice";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "../utils/constants";
import confetti from "canvas-confetti";

const FEATURES = [
  {
    title: "Swipe through dev profiles",
    desc: "Meet engineers, hackers & founders who build like you.",
  },
  {
    title: "Chat in realtime",
    desc: "Socket-powered conversations with instant pair sessions.",
  },
  {
    title: "Verified gold badges",
    desc: "Trusted members get highlighted, boosted profiles.",
  },
];

const STATS = [
  { value: "10K+", label: "Developers" },
  { value: "45K+", label: "Matches" },
  { value: "4.9", label: "Community rating" },
];

const fireWelcome = () => {
  try {
    confetti({
      particleCount: 120,
      spread: 75,
      startVelocity: 35,
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
      console.log(err);
      setError(err?.response?.data || "Login failed. Please check your credentials.");
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

  return (
    <div className="relative min-h-[82vh] flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8 overflow-hidden">
      {/* Ambient Glow Backdrops */}
      <div className="absolute top-10 left-1/4 w-96 h-96 bg-primary/15 rounded-full blur-[130px] pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-[28rem] h-96 bg-accent/10 rounded-full blur-[130px] pointer-events-none"></div>
      <div className="absolute top-1/3 right-0 w-72 h-72 bg-secondary/10 rounded-full blur-[110px] pointer-events-none"></div>

      <div className="w-full max-w-6xl relative z-10 grid lg:grid-cols-[1.05fr_1fr] rounded-[2rem] overflow-hidden border border-white/10 shadow-[0_40px_120px_-40px_rgba(0,0,0,0.9)]">
        {/* ------- Welcome Panel (desktop) ------- */}
        <aside className="hidden lg:flex relative flex-col justify-between p-12 bg-gradient-to-br from-primary/25 via-primary/10 to-accent/15 overflow-hidden">
          {/* decorative orbs */}
          <div className="absolute -top-24 -right-24 w-80 h-80 bg-secondary/30 rounded-full blur-[90px]"></div>
          <div className="absolute -bottom-32 -left-20 w-96 h-96 bg-primary/25 rounded-full blur-[100px]"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.08),transparent_55%)]"></div>

          {/* floating heart card */}
          <div className="absolute top-1/4 right-8 animate-slide-up" style={{ animationDelay: "0.5s" }}>
            <div className="glass-card rounded-2xl p-4 border border-white/20 shadow-2xl flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/30">
                <svg className="w-5 h-5 text-white fill-current" viewBox="0 0 24 24">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
              </div>
              <div>
                <p className="text-xs font-black text-white">It's a match!</p>
                <p className="text-[10px] text-white/60">Full-stack ✕ Frontend</p>
              </div>
            </div>
          </div>

          {/* brand */}
          <div className="relative">
            <div className="flex items-center gap-3 animate-slide-up">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary to-secondary p-0.5 shadow-lg shadow-primary/30 flex items-center justify-center">
                <div className="w-full h-full bg-base-950 rounded-[0.9rem] flex items-center justify-center">
                  <svg className="w-6 h-6 text-primary fill-current" viewBox="0 0 24 24">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                  </svg>
                </div>
              </div>
              <span className="text-2xl font-black tracking-tight text-white bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
                DevTinder
              </span>
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
              <span className="bg-gradient-to-r from-rose-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
                perfect match
              </span>
            </h1>

            <p className="text-sm text-white/70 leading-relaxed max-w-md animate-slide-up" style={{ animationDelay: "0.2s" }}>
              Meet your co-founder, pair programming buddy, or future team.
              We match developers on stack, vibe and ambition — not just looks.
            </p>

            <div className="space-y-3 pt-2">
              {FEATURES.map((f, i) => (
                <div key={f.title} className="flex items-start gap-3 animate-slide-up" style={{ animationDelay: `${0.3 + i * 0.1}s` }}>
                  <div className="mt-0.5 w-5 h-5 shrink-0 rounded-full bg-emerald-400/20 border border-emerald-400/40 flex items-center justify-center">
                    <svg className="w-3 h-3 text-emerald-300 fill-current" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
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
                <div key={s.label}>
                  <p className="text-2xl font-black text-white bg-gradient-to-r from-rose-400 to-purple-400 bg-clip-text text-transparent">
                    {s.value}
                  </p>
                  <p className="text-[10px] uppercase tracking-widest text-white/50">{s.label}</p>
                </div>
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
        <div className="bg-base-950/80 backdrop-blur-2xl p-8 sm:p-10 lg:p-12">
          {/* compact brand header (mobile/tablet) */}
          <div className="lg:hidden text-center mb-8 animate-slide-up">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary to-secondary p-0.5 mx-auto mb-3 shadow-lg shadow-primary/20 flex items-center justify-center">
              <div className="w-full h-full bg-base-950 rounded-[0.9rem] flex items-center justify-center">
                <svg className="w-6 h-6 text-primary fill-current" viewBox="0 0 24 24">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
              </div>
            </div>
            <h2 className="text-2xl font-black tracking-tight text-white">
              {isLoginForm ? "Welcome Back" : "Join DevTinder"}
            </h2>
            <p className="text-xs text-base-content/60 mt-1">
              {isLoginForm
                ? "Match with software engineers & pair program"
                : "Create your developer profile & showcase your stack"}
            </p>
          </div>

          {/* Header & Tab Toggle */}
          <div className="text-center mb-8 hidden lg:block animate-slide-up">
            <h2 className="text-3xl font-black tracking-tight text-white">
              {isLoginForm ? "Welcome Back" : "Join DevTinder"}
            </h2>
            <p className="text-xs text-base-content/60 mt-1">
              {isLoginForm
                ? "Match with software engineers & pair program"
                : "Create your developer profile & showcase your stack"}
            </p>
          </div>

          {/* Segmented Switcher */}
          <div className="flex bg-base-900/80 p-1 rounded-2xl border border-white/10 mb-8 animate-slide-up" style={{ animationDelay: "0.1s" }}>
            <button
              className={`flex-1 py-2 rounded-xl text-xs font-black transition-all ${
                isLoginForm
                  ? "bg-primary text-white shadow-md shadow-primary/30"
                  : "text-base-content/60 hover:text-white"
              }`}
              onClick={() => {
                setError("");
                setIsLoginForm(true);
              }}
            >
              Sign In
            </button>
            <button
              className={`flex-1 py-2 rounded-xl text-xs font-black transition-all ${
                !isLoginForm
                  ? "bg-primary text-white shadow-md shadow-primary/30"
                  : "text-base-content/60 hover:text-white"
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
                  <label className="input input-bordered bg-base-900/60 border-white/10 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all flex items-center gap-2 rounded-xl">
                    <input
                      type="text"
                      className="grow text-xs text-white placeholder-base-content/30 focus:outline-none"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                      placeholder="Ujjal"
                    />
                  </label>
                </div>

                <div className="form-control">
                  <label className="label py-1">
                    <span className="label-text text-[11px] font-bold uppercase tracking-wider text-base-content/70">Last Name</span>
                  </label>
                  <label className="input input-bordered bg-base-900/60 border-white/10 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all flex items-center gap-2 rounded-xl">
                    <input
                      type="text"
                      className="grow text-xs text-white placeholder-base-content/30 focus:outline-none"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                      placeholder="Roy"
                    />
                  </label>
                </div>
              </div>
            )}

            <div className="form-control">
              <label className="label py-1">
                <span className="label-text text-[11px] font-bold uppercase tracking-wider text-base-content/70">Developer Email</span>
              </label>
              <label className="input input-bordered bg-base-900/60 border-white/10 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all flex items-center gap-2 rounded-xl">
                <svg className="w-4 h-4 text-base-content/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <input
                  type="email"
                  className="grow text-xs text-white placeholder-base-content/30 focus:outline-none"
                  value={emailId}
                  onChange={(e) => setEmailId(e.target.value)}
                  required
                  placeholder="ujjal@example.com"
                />
              </label>
            </div>

            <div className="form-control">
              <label className="label py-1">
                <span className="label-text text-[11px] font-bold uppercase tracking-wider text-base-content/70">Password</span>
              </label>
              <label className="input input-bordered bg-base-900/60 border-white/10 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all flex items-center gap-2 rounded-xl pr-2">
                <svg className="w-4 h-4 text-base-content/40 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <input
                  type={showPassword ? "text" : "password"}
                  className="grow text-xs text-white placeholder-base-content/30 focus:outline-none bg-transparent"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
                    /* Eye-off icon */
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    /* Eye icon */
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </label>
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
              className="btn btn-primary w-full rounded-2xl h-12 font-black text-xs uppercase tracking-wider bg-gradient-to-r from-primary to-secondary border-none text-white hover:opacity-95 shadow-xl shadow-primary/25 hover:scale-[1.01] active:scale-95 transition-all"
              onClick={isLoginForm ? handleLogin : handleSignUp}
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
            <p className="text-[10px] text-base-content/40 text-center mt-4">
              Free forever for developers • No card required
            </p>
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
