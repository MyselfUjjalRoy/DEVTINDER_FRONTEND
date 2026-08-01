import { useRef } from "react";
import { Link } from "react-router-dom";
import ConstellationBackground from "./ConstellationBackground";
import Reveal from "./Reveal";
import { useCountUp, useTypewriter } from "../utils/hooks";

const HERO_TAGLINES = [
  "Co-founders matched",
  "Solo devs teamed up",
  "Stack soulmates found",
  "Side projects shipped",
];

const TECHS = [
  { name: "React", color: "text-cyan-400" },
  { name: "Node.js", color: "text-emerald-400" },
  { name: "Python", color: "text-yellow-400" },
  { name: "TypeScript", color: "text-sky-400" },
  { name: "Go", color: "text-cyan-300" },
  { name: "Rust", color: "text-orange-400" },
  { name: "AWS", color: "text-amber-400" },
  { name: "Docker", color: "text-blue-400" },
  { name: "GraphQL", color: "text-pink-400" },
  { name: "PostgreSQL", color: "text-sky-300" },
  { name: "Kubernetes", color: "text-blue-300" },
  { name: "MongoDB", color: "text-green-400" },
  { name: "Vue", color: "text-teal-400" },
  { name: "Angular", color: "text-red-400" },
];

const STATS = [
  { end: 10, suffix: "K+", decimals: 0, label: "Active Developers", gradient: "from-rose-400 to-pink-400" },
  { end: 45, suffix: "K+", decimals: 0, label: "Successful Matches", gradient: "from-purple-400 to-indigo-400" },
  { end: 99.8, suffix: "%", decimals: 1, label: "Code Compatibility", gradient: "from-cyan-400 to-sky-400" },
  { end: 24, suffix: "/7", decimals: 0, label: "Pair Session Chat", gradient: "from-amber-400 to-orange-400" },
];

const STEPS = [
  {
    title: "Build your dev profile",
    desc: "Add your stack, skills, GitHub vibes and what you're building next.",
    icon: (
      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
  {
    title: "Swipe & match",
    desc: "Filter by React, Node, Python, AWS. Swipe right to connect instantly.",
    icon: (
      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
      </svg>
    ),
  },
  {
    title: "Chat & ship together",
    desc: "Realtime socket chat, code snippets and pair sessions — start building today.",
    icon: (
      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
      </svg>
    ),
  },
];

const FEATURES = [
  {
    title: "Interactive Swipe Deck",
    desc: "Filter by React, Node, Python, AWS or TypeScript and swipe through verified builders instantly.",
    gradient: "from-rose-500 to-pink-500",
    glow: "shadow-rose-500/30",
    icon: (
      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
      </svg>
    ),
  },
  {
    title: "Realtime Socket Chat",
    desc: "Instant WebSocket messaging. Share code snippets and organize pair-programming sessions.",
    gradient: "from-purple-500 to-indigo-500",
    glow: "shadow-purple-500/30",
    icon: (
      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
      </svg>
    ),
  },
  {
    title: "Stack-Based Matching",
    desc: "The algorithm ranks you by tech-stack affinity, coding goals and active availability.",
    gradient: "from-cyan-500 to-sky-500",
    glow: "shadow-cyan-500/30",
    icon: (
      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c1.1 0 2 .9 2 2v4c0 1.1-.9 2-2 2H7c-1.1 0-2-.9-2-2V5c0-1.1.9-2 2-2zM17 7h.01M17 3h5c1.1 0 2 .9 2 2v4c0 1.1-.9 2-2 2h-5c-1.1 0-2-.9-2-2V5c0-1.1.9-2 2-2zM7 13h.01M7 21h5c1.1 0 2-.9 2-2v-4c0-1.1-.9-2-2-2H7c-1.1 0-2 .9-2 2v4c0 1.1.9 2 2 2zM17 13h.01M17 21h5c1.1 0 2-.9 2-2v-4c0-1.1-.9-2-2-2h-5c-1.1 0-2 .9-2 2v4c0 1.1.9 2 2 2z" />
      </svg>
    ),
  },
  {
    title: "Code Snippet Sharing",
    desc: "Drop formatted code blocks right into chat and skip the screenshots forever.",
    gradient: "from-emerald-500 to-teal-500",
    glow: "shadow-emerald-500/30",
    icon: (
      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
      </svg>
    ),
  },
  {
    title: "Verified Dev Badges",
    desc: "Silver and gold verification mark trusted members and unlock unlimited requests.",
    gradient: "from-amber-500 to-yellow-500",
    glow: "shadow-amber-500/30",
    icon: (
      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
      </svg>
    ),
  },
  {
    title: "Premium Feed Boost",
    desc: "Top placement in feeds, priority views and a gold badge that gets you noticed.",
    gradient: "from-orange-500 to-amber-500",
    glow: "shadow-orange-500/30",
    icon: (
      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
      </svg>
    ),
  },
];

const CountStat = ({ end, suffix = "", decimals = 0, label, gradient }) => {
  const value = useCountUp(end);
  return (
    <div className="glass-card p-6 rounded-2xl border border-white/5 text-center group hover:border-white/20 hover:-translate-y-1 transition-all duration-300">
      <span className={`text-3xl font-black bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}>
        {value.toFixed(decimals)}
        {suffix}
      </span>
      <p className="text-xs text-base-content/50 font-semibold mt-1">{label}</p>
    </div>
  );
};

const Landing = () => {
  const typed = useTypewriter(HERO_TAGLINES);
  const deckRef = useRef(null);
  const glareRef = useRef(null);

  const handleDeckTilt = (e) => {
    const el = deckRef.current;
    if (!el) return;
    if (window.matchMedia("(hover: none)").matches) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    el.style.transform = `perspective(1000px) rotateX(${(-py * 6).toFixed(2)}deg) rotateY(${(px * 6).toFixed(2)}deg)`;
    el.style.setProperty("--glare-x", `${((px + 0.5) * 100).toFixed(1)}%`);
    el.style.setProperty("--glare-y", `${((py + 0.5) * 100).toFixed(1)}%`);
    if (glareRef.current) glareRef.current.style.opacity = "1";
  };

  const handleDeckTiltLeave = () => {
    const el = deckRef.current;
    if (!el) return;
    el.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg)";
    if (glareRef.current) glareRef.current.style.opacity = "0";
  };

  return (
    <div className="relative overflow-hidden bg-base-950 text-base-content min-h-screen">
      <ConstellationBackground />

      {/* Aurora blobs */}
      <div className="absolute top-10 left-10 w-96 h-96 bg-primary/20 rounded-full blur-[130px] pointer-events-none animate-aurora"></div>
      <div className="absolute top-1/3 right-10 w-[30rem] h-[30rem] bg-secondary/15 rounded-full blur-[140px] pointer-events-none animate-aurora" style={{ animationDelay: "-6s" }}></div>
      <div className="absolute bottom-10 left-1/4 w-80 h-80 bg-accent/15 rounded-full blur-[110px] pointer-events-none animate-aurora" style={{ animationDelay: "-11s" }}></div>

      {/* Futuristic grid floor */}
      <div className="grid-floor hidden lg:block"></div>

      {/* ════════════ HERO ════════════ */}
      <section className="relative max-w-7xl mx-auto px-4 pt-20 pb-24 sm:px-6 lg:px-8 text-center flex flex-col items-center">
        {/* Announcement badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-black uppercase tracking-wider mb-8 shadow-lg shadow-primary/10 animate-slide-up">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
          </span>
          Match • Code • Build • Repeat
        </div>

        {/* Hero Title */}
        <div className="relative w-full max-w-5xl animate-slide-up" style={{ animationDelay: "0.1s" }}>
          {/* glow behind headline */}
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 mx-auto w-3/4 h-28 bg-gradient-to-r from-rose-500/30 via-purple-500/25 to-cyan-400/30 rounded-full blur-[90px] pointer-events-none animate-pulse-glow"></div>

          <h1 className="relative text-5xl sm:text-7xl md:text-8xl font-black text-white tracking-tight leading-[1.02]">
            <span className="block">Where Developers</span>
            <span className="block bg-[linear-gradient(90deg,#fb7185,#f472b6,#c084fc,#67e8f9)] bg-clip-text text-transparent animate-gradient drop-shadow-[0_0_40px_rgba(244,114,182,0.35)]">
              Find Their Match
            </span>
          </h1>

          {/* animated underline */}
          <div className="relative mx-auto mt-6 h-1.5 w-40 sm:w-64 rounded-full bg-gradient-to-r from-rose-500 via-purple-500 to-cyan-400 animate-underline shadow-[0_0_20px_rgba(244,114,182,0.5)]"></div>
        </div>

        {/* Typewriter */}
        <div className="mt-5 flex items-center justify-center text-base sm:text-xl font-bold text-white/85 min-h-[1.75rem] animate-slide-up" style={{ animationDelay: "0.2s" }}>
          <span className="text-white/40 mr-2">›</span>
          <span>{typed}</span>
          <span className="typewriter-cursor"></span>
        </div>

        <p className="mt-5 text-base sm:text-xl text-base-content/70 max-w-2xl leading-relaxed animate-slide-up" style={{ animationDelay: "0.3s" }}>
          Swipe through developer profiles, pair code on next-gen ideas, and discover your co-founder or project match on <strong className="text-white">DevTinder</strong>.
        </p>

        {/* CTAs */}
        <div className="mt-10 flex flex-col sm:flex-row gap-5 justify-center w-full sm:w-auto animate-slide-up" style={{ animationDelay: "0.4s" }}>
          <Link
            to="/login"
            className="group relative inline-flex items-center justify-center px-10 h-16 rounded-2xl font-black text-base text-white transition-all duration-300 hover:-translate-y-1 active:scale-95"
          >
            <span className="absolute -inset-[2px] rounded-2xl bg-[linear-gradient(120deg,#fb7185,#f472b6,#a78bfa,#22d3ee,#fb7185)] bg-[length:300%_300%] animate-gradient opacity-90 blur-[2px]"></span>
            <span className="absolute inset-0 rounded-2xl bg-base-950"></span>
            <span className="absolute inset-[2px] rounded-2xl bg-gradient-to-r from-rose-500 via-pink-500 to-purple-500"></span>
            <span className="pointer-events-none absolute inset-[2px] rounded-2xl bg-[linear-gradient(110deg,transparent_30%,rgba(255,255,255,0.45)_50%,transparent_70%)] bg-[length:220%_100%] bg-no-repeat animate-gradient"></span>
            <span className="relative flex items-center gap-2.5">
              Start Swiping Free
              <svg className="w-5 h-5 fill-current transition-transform duration-300 group-hover:translate-x-1.5" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </span>
          </Link>

          <a
            href="#how"
            className="group relative inline-flex items-center justify-center px-9 h-16 rounded-2xl font-bold text-base text-white border border-white/15 bg-white/5 backdrop-blur-xl overflow-hidden transition-all duration-300 hover:-translate-y-1 active:scale-95"
          >
            <span className="pointer-events-none absolute -inset-px rounded-2xl bg-gradient-to-r from-rose-500/50 via-purple-500/50 to-cyan-400/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-[1px]"></span>
            <span className="relative flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-xl bg-gradient-to-br from-rose-500 via-pink-500 to-purple-500 flex items-center justify-center shadow-lg shadow-rose-500/30 group-hover:rotate-12 group-hover:scale-110 transition-transform">
                <svg className="w-3.5 h-3.5 fill-current text-white" viewBox="0 0 24 24">
                  <path d="M8 5.14v13.72L19 12 8 5.14z" />
                </svg>
              </span>
              How it Works
            </span>
          </a>
        </div>

        {/* Live Interactive Deck Card Mockup */}
        <div className="relative w-full max-w-md mx-auto mt-16">
          {/* ambient glow */}
          <div className="absolute inset-x-8 inset-y-4 bg-gradient-to-tr from-primary/40 via-secondary/30 to-accent/40 rounded-3xl blur-2xl pointer-events-none animate-pulse-glow"></div>

          {/* stacked deck peeks */}
          <div className="absolute inset-x-8 top-3 h-[calc(100%-20px)] rounded-3xl bg-gradient-to-tr from-rose-500/20 to-purple-500/20 border border-white/10 -rotate-2"></div>
          <div className="absolute inset-x-4 top-1.5 h-[calc(100%-14px)] rounded-3xl bg-white/5 border border-white/10 -rotate-1"></div>

          {/* floating hearts */}
          <div className="float-heart text-rose-500 text-lg" style={{ left: "4%", animationDuration: "3s", animationDelay: "-0.5s" }}>♥</div>
          <div className="float-heart text-pink-400 text-sm" style={{ left: "88%", animationDuration: "3.6s", animationDelay: "-1.4s" }}>♥</div>
          <div className="float-heart text-purple-400 text-base" style={{ left: "78%", animationDuration: "4.2s", animationDelay: "-2.2s" }}>♥</div>

          {/* floating code chips */}
          <div className="absolute -left-12 top-16 hidden xl:block glass-card rounded-xl px-3.5 py-2.5 border border-white/10 shadow-2xl animate-float-y">
            <span className="text-xs font-mono text-cyan-400">{"</>"}</span>
            <span className="text-xs font-mono text-white/70 ml-1">deploy();</span>
          </div>
          <div className="absolute -right-12 bottom-24 hidden xl:block glass-card rounded-xl px-3.5 py-2.5 border border-white/10 shadow-2xl animate-float-y" style={{ animationDelay: "-2.5s" }}>
            <span className="text-xs font-mono text-amber-400">git push</span>
            <span className="text-xs text-emerald-400 ml-1">✓ shipped</span>
          </div>

          <div className="animate-float-slow">
            <div
              ref={deckRef}
              onMouseMove={handleDeckTilt}
              onMouseLeave={handleDeckTiltLeave}
              className="relative transition-transform duration-150 ease-out will-change-transform"
            >
              <div className="glass-card text-left rounded-[1.75rem] shadow-2xl overflow-hidden border border-white/15 relative">
                <div ref={glareRef} className="glare-overlay" style={{ borderRadius: "0" }}></div>

                {/* photo */}
                <figure className="relative h-72 w-full overflow-hidden bg-base-900">
                  <img
                    src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=500&q=80"
                    alt="Sarah Jenkins Developer"
                    className="h-full w-full object-cover select-none"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-base-950 via-base-950/30 to-transparent"></div>

                  {/* tinder-style progress dots */}
                  <div className="absolute top-4 left-4 right-4 flex gap-1.5">
                    <span className="h-1 flex-1 rounded-full bg-white/25 overflow-hidden">
                      <span className="block h-full w-full bg-white/90 rounded-full"></span>
                    </span>
                    <span className="h-1 flex-1 rounded-full bg-white/25 overflow-hidden">
                      <span className="block h-full w-1/2 bg-white/90 rounded-full"></span>
                    </span>
                    <span className="h-1 flex-1 rounded-full bg-white/25"></span>
                  </div>

                  {/* gold verified */}
                  <div className="absolute top-8 right-4 w-8 h-8 rounded-full bg-base-950/60 backdrop-blur-md border border-amber-400/40 flex items-center justify-center" title="Gold Verified">
                    <svg className="w-4 h-4 text-amber-400 fill-current" viewBox="0 0 24 24">
                      <path d="M12 1l2.9 2.4 3.7-.7.7 3.7L21.7 9l-1.9 3.2 1.9 3.2-2.4 2.6-.7 3.7-3.7-.7L12 23l-2.9-2.4-3.7.7-.7-3.7L2.3 15.4 4.2 12 2.3 8.8l2.4-2.6.7-3.7 3.7.7L12 1z" />
                    </svg>
                  </div>

                  {/* profile info */}
                  <div className="absolute bottom-3 left-5 right-5">
                    <div className="flex items-center justify-between">
                      <h3 className="text-2xl font-black text-white drop-shadow-md">Sarah, 26</h3>
                      <span className="badge bg-base-950/70 backdrop-blur-md text-emerald-300 border border-emerald-400/30 text-[9px] font-black uppercase tracking-wider px-2.5 py-1 flex items-center gap-1">
                        <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse"></span>
                        Online
                      </span>
                    </div>
                    <p className="text-[11px] font-bold text-secondary uppercase tracking-widest mt-0.5">Full Stack Wizard</p>
                    <p className="text-[11px] text-white/60 mt-0.5 flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Bengaluru, India
                    </p>
                  </div>
                </figure>

                <div className="p-5 space-y-4">
                  {/* compatibility meter */}
                  <div>
                    <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider">
                      <span className="text-base-content/40">Stack Compatibility</span>
                      <span className="bg-[linear-gradient(90deg,#fb7185,#c084fc,#67e8f9)] bg-clip-text text-transparent">92%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-white/10 mt-1.5 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[linear-gradient(90deg,#fb7185,#f472b6,#c084fc,#67e8f9)] animate-grow-bar shadow-[0_0_12px_rgba(244,114,182,0.6)]"
                        style={{ "--bar-w": "92%" }}
                      ></div>
                    </div>
                  </div>

                  {/* skills */}
                  <div className="flex flex-wrap gap-1.5">
                    <span className="badge badge-sm bg-cyan-500/10 text-cyan-400 border-cyan-500/20 font-bold">React 19</span>
                    <span className="badge badge-sm bg-sky-500/10 text-sky-400 border-sky-500/20 font-bold">TypeScript</span>
                    <span className="badge badge-sm bg-emerald-500/10 text-emerald-400 border-emerald-500/20 font-bold">Node.js</span>
                    <span className="badge badge-sm bg-purple-500/10 text-purple-400 border-purple-500/20 font-bold">GraphQL</span>
                  </div>

                  {/* action bar */}
                  <div className="flex items-center justify-center gap-8 pt-1 border-t border-white/5">
                    <button className="w-12 h-12 rounded-full bg-base-900 border border-white/10 text-rose-500 text-xl font-black shadow-lg flex items-center justify-center hover:scale-110 hover:border-rose-500/40 hover:shadow-rose-500/20 active:scale-90 transition-all">
                      ✕
                    </button>
                    <button className="w-16 h-16 rounded-full bg-gradient-to-tr from-rose-500 via-pink-500 to-purple-500 text-white text-2xl shadow-xl shadow-rose-500/30 flex items-center justify-center hover:scale-110 active:scale-90 transition-all animate-heartbeat">
                      ♥
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tech Marquee */}
        <div className="mt-20 w-full max-w-5xl tech-marquee-mask overflow-hidden">
          <div className="tech-marquee-track items-center gap-4">
            {[...TECHS, ...TECHS].map((t, i) => (
              <span
                key={`${t.name}-${i}`}
                className={`glass-card shrink-0 px-5 py-2.5 rounded-xl border border-white/10 text-sm font-bold ${t.color} whitespace-nowrap`}
              >
                {t.name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════ STATS ════════════ */}
      <section className="relative border-t border-white/5 bg-base-900/40 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {STATS.map((s) => (
                <CountStat key={s.label} end={s.end} suffix={s.suffix} decimals={s.decimals} label={s.label} gradient={s.gradient} />
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ════════════ HOW IT WORKS ════════════ */}
      <section id="how" className="relative py-24 scroll-mt-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal className="text-center mb-16">
            <h2 className="text-xs uppercase font-extrabold tracking-widest text-primary">How it Works</h2>
            <h3 className="text-3xl sm:text-5xl font-black text-white tracking-tight mt-2">
              Three steps to your{" "}
              <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent animate-gradient">
                dream team
              </span>
            </h3>
          </Reveal>

          <div className="relative grid grid-cols-1 md:grid-cols-3 gap-10">
            {/* connector line */}
            <div className="hidden md:block absolute top-8 left-[12%] right-[12%] h-px border-t-2 border-dashed border-white/10"></div>

            {STEPS.map((step, i) => (
              <Reveal key={step.title} delay={i * 120} className="relative">
                <div className="flex flex-col items-center text-center">
                  <div className="relative mb-6">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary via-secondary to-accent p-[1.5px] shadow-xl shadow-primary/25">
                      <div className="w-full h-full rounded-[calc(2rem-2px)] bg-base-950 flex items-center justify-center">
                        {step.icon}
                      </div>
                    </div>
                    <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-gradient-to-br from-primary to-secondary text-white text-[11px] font-black flex items-center justify-center shadow-lg">
                      {i + 1}
                    </div>
                  </div>
                  <h4 className="text-lg font-black text-white">{step.title}</h4>
                  <p className="text-sm text-base-content/65 leading-relaxed mt-2 max-w-xs">{step.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════ FEATURES ════════════ */}
      <section id="features" className="relative border-t border-white/5 bg-base-900/40 py-24 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal className="text-center mb-16">
            <h2 className="text-xs uppercase font-extrabold tracking-widest text-primary">Why DevTinder?</h2>
            <h3 className="text-3xl sm:text-5xl font-black text-white tracking-tight mt-2">
              Designed Exclusively for{" "}
              <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent animate-gradient">
                Software Engineers
              </span>
            </h3>
            <p className="text-sm sm:text-base text-base-content/65 max-w-xl mx-auto mt-4">
              Stop searching random forums. Find verified developer matches based on tech stack affinity, coding goals, and active availability.
            </p>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {FEATURES.map((f, i) => (
              <Reveal key={f.title} delay={(i % 3) * 100}>
                <div className="glass-card p-8 rounded-3xl space-y-4 border border-white/10 hover:border-primary/40 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-300 group h-full">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${f.gradient} ${f.glow} shadow-lg flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}>
                    {f.icon}
                  </div>
                  <h4 className="text-xl font-black text-white">{f.title}</h4>
                  <p className="text-sm text-base-content/70 leading-relaxed">{f.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════ FINAL CTA ════════════ */}
      <section className="relative max-w-5xl mx-auto px-4 py-24 sm:px-6 lg:px-8">
        <Reveal>
          <div className="border-animated p-[1.5px] rounded-[2rem] shadow-[0_40px_120px_-40px_rgba(0,0,0,0.9)]">
            <div className="glass-panel rounded-[calc(2rem-1.5px)] overflow-hidden relative p-10 sm:p-16 text-center space-y-6">
              <div className="absolute -top-12 -left-12 w-56 h-56 bg-primary/25 rounded-full blur-3xl pointer-events-none animate-aurora"></div>
              <div className="absolute -bottom-12 -right-12 w-56 h-56 bg-secondary/25 rounded-full blur-3xl pointer-events-none animate-aurora" style={{ animationDelay: "-8s" }}></div>

              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-black uppercase tracking-wider">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                Free forever for developers
              </div>

              <h3 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
                Ready to Find Your{" "}
                <span className="bg-gradient-to-r from-rose-400 via-pink-400 to-purple-400 bg-clip-text text-transparent animate-gradient">
                  Next Coding Partner?
                </span>
              </h3>
              <p className="text-sm sm:text-base text-base-content/75 max-w-xl mx-auto leading-relaxed">
                Join thousands of developers matching, pair programming, and shipping projects together on DevTinder.
              </p>
              <div className="pt-2">
                <Link
                  to="/login"
                  className="btn btn-primary btn-shine bg-gradient-to-r from-primary to-secondary border-none text-white px-10 rounded-2xl h-14 font-black text-sm shadow-xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all inline-flex items-center gap-2"
                >
                  <span>Join DevTinder Today</span>
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
};

export default Landing;
